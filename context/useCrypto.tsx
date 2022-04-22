import { createContext, Dispatch, SetStateAction, useContext, useState, useEffect } from 'react'
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import TokenContract from '../abis/EthordleToken.json';
import { downloadFile } from '../services/fileSystem';
import { useLocalStorage } from '../services/localStorage';
import { pinFileToIpfs, pinJsonToIpfs } from '../services/fileSystem';

import * as Entities from '../model/entities';

interface ContextInterface {
   gameMode: Entities.GameMode,
   setGameMode: Dispatch<SetStateAction<Entities.GameMode>>,
   account: string,
   setAccount: Dispatch<SetStateAction<string>>,
   contract: Contract,
   setContract: Dispatch<SetStateAction<Contract>>,
   connectToBlockchain: () => Promise<boolean>,
   mintToken: (solution: string, price: string, guessResults: string[], secondsRequired: number) => Promise<void>,
   buyToken: (id: number, price: string) => Promise<void>,
   tokens: Entities.Token[],
   getTokens: (boolean) => Promise<Entities.Token[]>
}

declare let window: any;

export const CryptoContext = createContext({} as ContextInterface);

export function CryptoProvider({ children }) {
   const [account, setAccount] = useState('');
   const [contract, setContract] = useState(null);
   const [gameMode, setGameMode] = useState(Entities.GameMode.Unknown);
   const [tokens, setTokens] = useLocalStorage('tokens', null as Entities.Token[]);

   useEffect(() => {
      (async () => {
         if (contract != null && account != '') {
            await getTokens();
         }
      })();
   }, [account, contract]);
   
   const connectToBlockchain = async (): Promise<boolean> => {
      if (!await loadWeb3()) {
         return false;
      }

      if (!await loadBlockchainData()) {
         return false;
      }

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

         setContract(contract);
         return true;
      } else {
         window.alert('Smart contract not deployed to a detected network.')
         return false;
      }
   }
        
   const getTokens = async (force = false): Promise<Entities.Token[]> => {
      const contractTokens = await contract.methods.tokens().call() as Entities.Token[];
      let newTokens: Entities.Token[] = [];
      
      for (const [i, token] of contractTokens.entries()) {
         let newToken = new Entities.Token({ id: token[0], owner: token[1], price: Number(Web3.utils.fromWei(token[2], 'ether')), url: token[3], solution: token[4], transactionCount: token[5] });

         try
         {
            const metadataFile = await downloadFile(token.url, 2000);
            const metadataString = String.fromCharCode.apply(null, new Uint8Array(metadataFile));
            const metadata = JSON.parse(metadataString);

            newToken.imageUrl = metadata.imageUrl;
            newToken.guesses = metadata.guesses;
            newToken.secondsRequired = metadata.secondsRequired; 
         }
         catch (ex) {
            console.log(ex);
            // let's assume that the metadata file hasn't been fully written to IPFS yet
            newToken.imageUrl = '';
            newToken.guesses = [];
            newToken.secondsRequired = 0; 
         }

         newTokens.push(newToken);  
         
      }
 
      newTokens.sort(function (a, b) { return b.price - a.price || a.solution.localeCompare(b.solution) });
      setTokens(newTokens, 60);

      return newTokens;
   }

   const mintToken = async (solution: string, price: string, guessResults: string[], secondsRequired: number) => {
      const imageUrl = await pinFileToIpfs(`/solutions/${solution}.png`);  
     
      const metadata: any = {
         solution: solution,
         imageUrl: imageUrl,
         secondsRequired: secondsRequired,
         guesses: guessResults
      };

      const metadataUrl = await pinJsonToIpfs(metadata);
      metadata.url = metadataUrl;

      await contract.methods.mint(account, solution, metadataUrl).send({ from: account, value: Web3.utils.toWei(price, 'ether') });   
   }
  
   const buyToken = async (id: number, price: string) => {      
      var wei = Web3.utils.toWei(price.toString(), 'ether');
      await contract.methods.buy(account, id).send({ from: account, value: wei });  
      
      getTokens(true);
   }

   return (
      <CryptoContext.Provider value={{ gameMode, setGameMode, account, setAccount, contract, setContract, connectToBlockchain, mintToken, buyToken, tokens, getTokens }}>{children}</CryptoContext.Provider>
   )
}

export const useCrypto = (): ContextInterface => {
   const { gameMode, setGameMode } = useContext(CryptoContext);
   const { account, setAccount } = useContext(CryptoContext);
   const { contract, setContract } = useContext(CryptoContext);
   const { connectToBlockchain } = useContext(CryptoContext);
   const { mintToken, buyToken } = useContext(CryptoContext);
   const { tokens, getTokens } = useContext(CryptoContext);

   return { gameMode, setGameMode, account, setAccount, contract, setContract, connectToBlockchain, mintToken, buyToken, tokens, getTokens };
}

