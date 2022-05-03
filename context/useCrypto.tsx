import { createContext, Dispatch, SetStateAction, useContext, useState, useEffect } from 'react'
import Web3 from 'web3';
import TokenContract from '../abis/EthordleToken.json';
import { Contract } from 'web3-eth-contract';
import { downloadFile } from '../services/fileSystem';
import { useLocalStorage } from '../services/localStorage';
import { pinFileToIpfs, pinJsonToIpfs } from '../services/fileSystem';

import * as Entities from '../model/entities';
import configSettings from '../config.json';

interface ContextInterface {
   isBlockchainConnected: boolean,
   initialTokenPrice: number,
   priceEscalationRate: number,
   royaltyRate: number,
   gameMode: Entities.GameMode,
   setGameMode: Dispatch<SetStateAction<Entities.GameMode>>,
   account: string,
   isContractOwner: boolean,
   contract: Contract,
   connectToBlockchain: () => Promise<boolean>,
   mintToken: (solution: string, guessResults: string[], secondsRequired: number) => Promise<void>,
   buyToken: (token: Entities.Token, price: number) => Promise<void>,
   transferToken: (token: Entities.Token, toAddress: string) => Promise<void>,
   allowTokenSale: (token: Entities.Token, price: number) => Promise<void>,
   preventTokenSale: (token: Entities.Token) => Promise<void>,
   tokens: Entities.Token[],
   getTokens: () => Promise<Entities.Token[]>,
}

declare let window: any;

export const CryptoContext = createContext({} as ContextInterface);

export function CryptoProvider({ children }) {
   const [account, setAccount] = useState('');
   const [contract, setContract] = useState(null);
   const [isContractOwner, setIsContractOwner] = useState(false);
   const [gameMode, setGameMode] = useState(Entities.GameMode.Unknown);
   const [tokens, setTokens] = useLocalStorage('tokens', null as Entities.Token[]);
   const [isBlockchainConnected, setIsBlockchainConnected] = useState(false); 
   const [initialTokenPrice, setInitialTokenPrice] = useState(0);
   const [priceEscalationRate, setPriceEscalationRate] = useState(0);
   const [royaltyRate, setRoyaltyRate] = useState(0);
   
   useEffect(() => {
      (async () => {                         
         if (contract != null && account != '') {
            await getTokens();
         }
      })();
   }, [account, contract]);

   const connectToBlockchain = async (): Promise<boolean> => {
      if (!await loadWeb3()) {
         setIsBlockchainConnected(false);
         return false;
      }

      if (!await loadBlockchainData()) {
         setIsBlockchainConnected(false);
         return false;
      }

      setIsBlockchainConnected(true);
      
      return true;
   }

   const loadWeb3 = async (): Promise<boolean> => {
      if (window.ethereum) {
         window.web3 = new Web3(window.ethereum);
         window.ethereum.on('accountsChanged', () => loadBlockchainData());
         window.ethereum.on('chainChanged', () => connectToBlockchain()); 
            
         try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return true;
         }
         catch (ex) {
            console.log(ex);
            return false;
         }
      }
      else if (window.web3) {
         window.web3 = new Web3(window.ethereum);
         return true;
      }
      else {
         return false;
      }
   }

   const loadBlockchainData = async (): Promise<boolean> => {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const tokenNetworkData = TokenContract.networks[networkId];

      setAccount(accounts[0]);

      if (tokenNetworkData) {
         const contractAddress = tokenNetworkData.address;
         const abi = TokenContract.abi;
         const contract = await new web3.eth.Contract(abi, contractAddress);
         
         const initialTokenPrice_ = Number(Web3.utils.fromWei(await contract.methods.initialPrice().call(), 'ether'));
         const royaltyRate_ = ((await contract.methods.royaltyRate().call()) / 100);
         const priceEscalationRate_ = ((await contract.methods.priceEscalationRate().call()) / 100);
         const owner_ = await contract.methods.owner().call();

         setContract(contract);
         setInitialTokenPrice(initialTokenPrice_);
         setRoyaltyRate(royaltyRate_);
         setPriceEscalationRate(priceEscalationRate_);
         setIsContractOwner(accounts[0] === owner_);
         console.log(owner_);
         return true;
      } else {
         window.alert('Smart contract not deployed to a detected network.')
         return false;
      }
   }

   const getTokens = async (): Promise<Entities.Token[]> => {      
      const contractTokens = await contract.methods.tokens().call() as Entities.Token[];
      let newTokens: Entities.Token[] = [];
      
      const urls = contractTokens.map((token) => token.url);
      const metadataFiles = await Promise.all(
         urls.map(url => downloadFile(url, 2000)
           .then(r => String.fromCharCode.apply(null, new Uint8Array(r)))
           .then(data => JSON.parse(data))
           .catch(error => ({ error, url }))
         )
       );
    
      for (const [i, token] of contractTokens.entries()) {         
         let newToken = new Entities.Token({ 
            id: token[0], 
            owner: token[1], 
            price: Number(Web3.utils.fromWei(token[2], 'ether')), 
            lastPrice: Number(Web3.utils.fromWei(token[3], 'ether')), 
            url: token[4], 
            solution: token[5], 
            isForSale: token[6], 
            lastTransactionTimestamp: new Date(token[7] * 1000).toISOString().slice(0, 19).replace('T', ' '), 
            transactionCount: token[8] });
            
         const metadataFile = metadataFiles[i];
      
         if (!metadataFile.image|| metadataFile.image == '') {         
            // let's assume that the metadata file hasn't been fully written to IPFS yet
            newToken.image = '';
            newToken.guesses = [];
            newToken.secondsRequired = 0; 
            console.log('Unable to load metadata from ' + token.url);
         } else {        
            newToken.image = metadataFile.image;
            newToken.guesses = metadataFile.attributes.guesses;
            newToken.secondsRequired = metadataFile.attributes.secondsRequired; 
         }
         
         newTokens.push(newToken);  
      } 

      newTokens.sort(function (a, b) { return b.price - a.price || a.solution.localeCompare(b.solution) });
      setTokens(newTokens, 60);
      
      return newTokens;
   }

   const mintToken = async (solution: string, guessResults: string[], secondsRequired: number) => {
      const image = await pinFileToIpfs(`/solutions/${solution}.png`);  
     
      const metadata: any = {
         name: solution,
         description: 'Ethordle NFT - ' + solution,
         image: image,
         attributes: {
            secondsRequired: secondsRequired,
            guesses: guessResults
         }
      };

      const metadataUrl = await pinJsonToIpfs(metadata);
      metadata.url = metadataUrl;

      await contract.methods.mint(account, solution, metadataUrl).send({ from: account, value: Web3.utils.toWei(initialTokenPrice.toString(), 'ether') });   
      await getTokens();
   }
  
   const buyToken = async (token: Entities.Token, price: number) => {    
      var wei = Web3.utils.toWei(price.toString(), 'ether');
      await contract.methods.buy(token.id, account).send({ from: account, value: wei });        
      getTokens();
   }

   const transferToken = async (token: Entities.Token, toAddress: string) => {    
      await contract.methods.transfer(token.id, toAddress).send({ from: account });        
      getTokens();
   }

   const allowTokenSale = async (token: Entities.Token, price: number) => {   
      var wei = Web3.utils.toWei(price.toString(), 'ether');
      await contract.methods.allowSale(token.id, account, wei).send({ from: account });       
      getTokens();       
   }
   
   const preventTokenSale = async (token: Entities.Token) => { 
      console.log('starting');  // todo
      await contract.methods.preventSale(token.id, account).send({ from: account });  
      console.log('ending'); 
      getTokens();    
      console.log('and got tokens');  
   }

   return (
      <CryptoContext.Provider value={{ 
         isBlockchainConnected, 
         initialTokenPrice, 
         priceEscalationRate, 
         royaltyRate, 
         gameMode, 
         setGameMode, 
         account, 
         isContractOwner,
         contract, 
         connectToBlockchain,
         mintToken, 
         buyToken, 
         transferToken,
         allowTokenSale, 
         preventTokenSale, 
         tokens, 
         getTokens
       }}>{children}</CryptoContext.Provider>
   )
}

export const useCrypto = (): ContextInterface => {
   const { isBlockchainConnected } = useContext(CryptoContext);
   const { initialTokenPrice, priceEscalationRate, royaltyRate } = useContext(CryptoContext);
   const { gameMode, setGameMode } = useContext(CryptoContext);
   const { account } = useContext(CryptoContext);
   const { contract } = useContext(CryptoContext);
   const { connectToBlockchain } = useContext(CryptoContext);
   const { mintToken, buyToken, transferToken } = useContext(CryptoContext);
   const { allowTokenSale, preventTokenSale } = useContext(CryptoContext);
   const { tokens, getTokens } = useContext(CryptoContext);
   const { isContractOwner } = useContext(CryptoContext);
   
   return { 
      isBlockchainConnected, 
      initialTokenPrice, 
      priceEscalationRate, 
      royaltyRate, 
      gameMode, 
      setGameMode, 
      account, 
      isContractOwner, 
      contract, 
      connectToBlockchain, 
      mintToken, 
      buyToken, 
      transferToken,
      allowTokenSale, 
      preventTokenSale, 
      tokens, 
      getTokens 
   };
}

