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
   connectToBlockchain: Promise<boolean>,
   ownerTokens: Entities.TokenMetadata[],
   getOwnerTokens: Promise<Entities.TokenMetadata[]>,
   allTokens: Entities.TokenMetadata[],
   getAllTokens: Promise<Entities.TokenMetadata[]>
}

declare let window: any;

export const CryptoContext = createContext({} as ContextInterface);

export function CryptoProvider({ children }) {
   const [account, setAccount] = useState('');
   const [contract, setContract] = useState(null);
   const [ownerTokens, setOwnerTokens] = useState([]);
   const [allTokens, setAllTokens] = useState([]);

   const loadWeb3 = async () : Promise<boolean> => {
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

   const loadBlockchainData = async () : Promise<boolean> => {
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

   const getOwnerTokens = async (account: string) : Promise<void> => { 
      const tokenIdsOfOwner = await contract.methods.tokensOfOwner(account).call();      
      const tokens: Entities.TokenMetadata[] = [];
     
      for (let i = 0; i < tokenIdsOfOwner.length; i++) {
         try { 
            const id = tokenIdsOfOwner[i];
            const token = await getToken(id);      

            tokens.push(token);            
         } catch (ex) {
            console.log(ex);
         }
      }

      tokens.sort(function(a, b) { return b.price - a.price || a.solution.localeCompare(b.solution) });
      
      setOwnerTokens(tokens);
   }

   const getAllTokens = async () : Promise<Entities.TokenMetadata[]> => {
      const tokenCount = await contract.methods.tokenCount().call();       
      const tokens: Entities.TokenMetadata[] = [];
      
      for (let i = 0; i < tokenCount; i++) {
         try { 
            const token = await getToken(i);
            tokens.push(token);            
         } catch (ex) {
            console.log(ex);
         }
      }

      tokens.sort(function(a, b) { return b.price - a.price || a.solution.localeCompare(b.solution) });

      return tokens;
   }

   const getToken = async(id : number) : Promise<Entities.TokenMetadata> => {
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
      <CryptoContext.Provider value={{ account, setAccount, contract, setContract, connectToBlockchain, ownerTokens, getOwnerTokens, allTokens, getAllTokens }}>{children}</CryptoContext.Provider>
   )
}

export const useCrypto = (): ContextInterface => {

   const { account, setAccount } = useContext(CryptoContext);
   const { contract, setContract } = useContext(CryptoContext);
   const { connectToBlockchain } = useContext(CryptoContext);
   const { ownerTokens, getOwnerTokens } = useContext(CryptoContext);
   const { allTokens, getAllTokens } = useContext(CryptoContext);

   return { account, setAccount, contract, setContract, connectToBlockchain, ownerTokens, getOwnerTokens, allTokens, getAllTokens };
}

