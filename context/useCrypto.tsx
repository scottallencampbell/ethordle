import { createContext, Dispatch, SetStateAction, useContext, useState, useEffect } from "react"
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
   tokens: Entities.TokenMetadata[],
   getTokens: Promise<Entities.TokenMetadata[]>
}

declare let window: any;

export const CryptoContext = createContext({} as ContextInterface);

export function CryptoProvider({ children }) {
   const [account, setAccount] = useState('');
   const [contract, setContract] = useState(null);
   const [tokens, setTokens] = useState([]);
   
   useEffect(() => {
      (async () => {
         if (contract != null && account != '') {
            await getTokens();
         }
      })();
   }, [account, contract]);

   const loadWeb3 = async (): Promise<boolean> => {
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

   const getTokens = async (): Promise<Entities.TokenMetadata[]> => {
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

      tokens.sort(function (a, b) { return b.price - a.price || a.solution.localeCompare(b.solution) });

      setTokens(tokens);
      return tokens;
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

   const connectToBlockchain = async (): Promise<boolean> => {
      if (!await loadWeb3()) {
         return false;
      }

      if (!await loadBlockchainData()) {
         return false;
      }

      return true;
   }

   return (
      <CryptoContext.Provider value={{ account, setAccount, contract, setContract, connectToBlockchain, tokens, getTokens }}>{children}</CryptoContext.Provider>
   )
}

export const useCrypto = (): ContextInterface => {

   const { account, setAccount } = useContext(CryptoContext);
   const { contract, setContract } = useContext(CryptoContext);
   const { connectToBlockchain } = useContext(CryptoContext);
   const { tokens, getTokens } = useContext(CryptoContext);

   return { account, setAccount, contract, setContract, connectToBlockchain, tokens, getTokens };
}

