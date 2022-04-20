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
   tokens: Entities.TokenMetadata[],
   getTokens: (boolean) => Promise<Entities.TokenMetadata[]>
}

declare let window: any;

export const CryptoContext = createContext({} as ContextInterface);

export function CryptoProvider({ children }) {
   const [account, setAccount] = useState('');
   const [contract, setContract] = useState(null);
   const [gameMode, setGameMode] = useState(Entities.GameMode.Unknown);
   const [tokens, setTokens] = useLocalStorage('tokens', null as Entities.TokenMetadata[]);

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

   const getTokens = async (force = false): Promise<Entities.TokenMetadata[]> => {
      if (tokens != null && !force) {
         return;
      }

      const tokenCount = await contract.methods.tokenCount().call();
      const newTokens: Entities.TokenMetadata[] = [];

      for (let i = 0; i < tokenCount; i++) {
         try {
            const token = await getToken(i);
            newTokens.push(token);
         } catch (ex) {
            console.log(ex);
         }
      }

      newTokens.sort(function (a, b) { return b.price - a.price || a.solution.localeCompare(b.solution) });
      setTokens(newTokens, 60);

      return newTokens;
   }

   const getToken = async (id: number): Promise<Entities.TokenMetadata> => {
      const owner = await contract.methods.ownerOf(id).call();
      const tokenURI = await contract.methods.tokenURI(id).call();
      const price = await contract.methods.price(id).call();
      const metadataFile = await downloadFile(tokenURI, 2000);
      const metadataString = String.fromCharCode.apply(null, new Uint8Array(metadataFile));
      const metadata = JSON.parse(metadataString);

      metadata.id = id;
      metadata.url = tokenURI;
      metadata.price = Web3.utils.fromWei(price, 'ether');
      metadata.owner = owner;

      return metadata;
   }

   const mintToken = async (solution: string, price: string, guessResults: string[], secondsRequired: number) => {
      const imageUrl = await pinFileToIpfs(`/solutions/${solution}.png`);  
      console.log('solution: ' + solution);
      console.log('price: ' + price);
      console.log('guessResults: ' + guessResults);
      console.log('seconds: ' + secondsRequired);
      
      const metadata: Entities.TokenMetadata = {
         solution: solution,
         imageUrl: imageUrl,
         secondsRequired: secondsRequired,
         guesses: guessResults,
         owner: account
      };

      const metadataUrl = await pinJsonToIpfs(metadata);
      metadata.url = metadataUrl;

      await contract.methods.mint(account, solution, metadataUrl).send({ from: account, value: Web3.utils.toWei(price, 'ether') });   
   }
  
   const buyToken = async (id: number, price: string) => {
      var price = Web3.utils.toWei(price, 'ether');
      await contract.methods.buy(account, id).send({ from: account, value: price });  
      
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

