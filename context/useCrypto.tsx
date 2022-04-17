import { createContext, Dispatch, SetStateAction, useContext, useState } from "react"
import Web3 from 'web3';
import { Contract } from "web3-eth-contract"
import TokenContract from '../abis/EthordleToken.json';
import { downloadFile } from '../helpers/file-system';

import * as Entities from '../model/entities';

interface ContextInterface {
   account: string,
   setAccount: Dispatch<SetStateAction<string>>,
   contract: Contract,
   setContract: Dispatch<SetStateAction<Contract>>,
   blockchain: boolean,
   connectToBlockchain: Promise<boolean>,
   tokens: Entities.TokenMetadata[],
   refreshTokens: Promise<Entities.TokenMetadata[]>
}

declare let window: any;

export const CryptoContext = createContext({} as ContextInterface);

export function CryptoProvider({ children }) {

   const [account, setAccount] = useState('');
   const [contract, setContract] = useState(null);
   const [tokens, setTokens] = useState(null);
   const [blockchain, ] = useState(false);

   const loadWeb3 = async () => {
      if (window.ethereum) {
         window.web3 = new Web3(window.ethereum);

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

   const loadBlockchainData = async () => {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const tokenNetworkData = TokenContract.networks[networkId];

      if (tokenNetworkData) {
         const contractAddress = tokenNetworkData.address;
         const abi = TokenContract.abi;
         const contract = await new web3.eth.Contract(abi, contractAddress);
         setContract(contract);

         console.log('Account: ' + accounts[0]);
         console.log('TokenAddress: ' + contractAddress);
         console.log('TokenContract: ' + contract);

         return true;
      } else {
         window.alert('Smart contract not deployed to a detected network.')
         return false;
      }
   }

   const refreshTokens = async () => {
      const tokenIdsOfOwner = await contract.methods.tokensOfOwner(account).call();      
      const existingTokens: Entities.TokenMetadata[] = [];
      
      for (let i = 0; i < tokenIdsOfOwner.length; i++) {
         try { 
            const tokenURI = await contract.methods.tokenURI(i).call();       
            const price = await contract.methods.price(i).call();                    
            const metadataFile = await downloadFile(tokenURI, 2000);
            const metadataString = String.fromCharCode.apply(null, new Uint8Array(metadataFile));
            const metadata = JSON.parse(metadataString);
            metadata.url = tokenURI;
            metadata.price = Web3.utils.fromWei(price, 'ether');

            console.log('TokenURI: ' + tokenURI);
            console.log('TokenImage: ' + metadata.imageUrl); 
            
            existingTokens.push(metadata);            
         } catch (ex) {
            console.log(ex);
         }
      }

      setTokens(existingTokens);
   }

   const connectToBlockchain = async () : Promise<boolean> => { 
      
      if (!await loadWeb3()) {
         return false;
      }

      if (!await loadBlockchainData()) {
         return false;
      }
      
      return true;   
   }

   return (
      <CryptoContext.Provider value={{ account, setAccount, contract, setContract, blockchain, connectToBlockchain, tokens, refreshTokens }}>{children}</CryptoContext.Provider>
   )
}

export const useCrypto = (): ContextInterface => {

   const { account, setAccount } = useContext(CryptoContext)
   const { contract, setContract } = useContext(CryptoContext)
   const { blockchain, connectToBlockchain } = useContext(CryptoContext)
   const { tokens, refreshTokens } = useContext(CryptoContext)

   return { account, setAccount, contract, setContract, blockchain, connectToBlockchain, tokens, refreshTokens };
}

