import { createContext, Dispatch, SetStateAction, useContext, useState, useEffect } from 'react'
import Web3 from 'web3';
import TokenContract from '../abis/EthordleToken.json';
import { Contract } from 'web3-eth-contract';
import { downloadFile } from '../services/fileSystem';
import { useLocalStorage } from '../services/localStorage';
import { pinFileToIpfs, pinJsonToIpfs } from '../services/fileSystem';

import * as Entities from '../models/entities';
import configSettings from '../config.json';
import { fulfillWithTimeLimit } from '../services/async';

interface ContextInterface {
   blockchainStatus: Entities.BlockchainStatus,
   transactionStatus: Entities.TransactionStatus,
   initialTokenPrice: number,
   priceEscalationRate: number,
   royaltyRate: number,
   account: string,
   isContractOwner: boolean,
   contract: Contract,
   networkName: string,
   validateBlockchain: () => Promise<Entities.BlockchainStatus>,   
   mintToken: (solution: string, guessResults: string[], secondsRequired: number, onStarted: Function, onFinished: Function) => Promise<void>,
   buyToken: (token: Entities.Token, price: number, onStarted: Function, onFinished: Function) => Promise<void>,
   transferTokenAsContractOwner: (token: Entities.Token, toAddress: string, onStarted: Function, onFinished: Function) => Promise<void>,
   allowTokenSale: (token: Entities.Token, price: number, onStarted: Function, onFinished: Function) => Promise<void>,
   preventTokenSale: (token: Entities.Token, onStarted: Function, onFinished: Function)=> Promise<void>,
   tokens: Entities.Token[],
   getTokens: () => Promise<Entities.Token[]>,
   updateToken: (token: Entities.Token) => Promise<Entities.Token[]>,
   explorerAddress: (path: string) => string,
}

declare let window: any;

export const CryptoContext = createContext({} as ContextInterface);

export function CryptoProvider({ children }) {
   const [blockchainStatus, setBlockchainStatus] = useState(Entities.BlockchainStatus.Unknown);
   const [transactionStatus, setTransactionStatus] = useState(Entities.TransactionStatus.Inactive);
   const [account, setAccount] = useState('');
   const [networkId, setNetworkId] = useState(0);
   const [networkName, setNetworkName] = useState('Unknown');
   const [contract, setContract] = useState(null);
   const [isContractOwner, setIsContractOwner] = useState(false);
   const [tokens, setTokens] = useLocalStorage('tokens', null as Entities.Token[]);
   const [initialTokenPrice, setInitialTokenPrice] = useState(0);
   const [priceEscalationRate, setPriceEscalationRate] = useState(0);
   const [royaltyRate, setRoyaltyRate] = useState(0);

   useEffect(() => {
      (async () => {      
         if (contract != null && account !== '') {
            await getTokens();
         }
      })();
   }, [account, contract]);

   const validateBlockchain = async (): Promise<Entities.BlockchainStatus> => {
      let status = Entities.BlockchainStatus.Unknown;

      try {
         status = await fulfillWithTimeLimit(3000, connectToBlockchain(), Entities.BlockchainStatus.ConnectionTimeout);         
      } catch (ex) {
         if (ex.toString().includes('did it run Out of Gas')) {              
            status = Entities.BlockchainStatus.NoGas;
         }
         else {
            status = Entities.BlockchainStatus.NotConnected;
         }
      }
   
      setBlockchainStatus(status);
      return status;
   }

   const connectToBlockchain = async (): Promise<Entities.BlockchainStatus> => {      
      if (!await loadWeb3()) {
         return Entities.BlockchainStatus.NoEthereum;
      }

      if (!await loadBlockchainData()) {
         return Entities.BlockchainStatus.NotConnected;
      }

      return Entities.BlockchainStatus.Connected;
   }

   const loadWeb3 = async (): Promise<boolean> => {
      if (window.ethereum) {
         window.web3 = new Web3(window.ethereum);
         window.ethereum.on('accountsChanged', () => validateBlockchain());
         window.ethereum.on('chainChanged', () => validateBlockchain());

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

      switch (networkId) {
         case 1: setNetworkName('Mainnet'); break;
         case 3: setNetworkName('Ropsten'); break;
         case 4: setNetworkName('Rinkeby'); break; 
         case 5: setNetworkName('Goerli'); break;
         case 42: setNetworkName ('Kovan'); break;
         case 5777: setNetworkName('Ganache'); break;
         default: setNetworkName('Unknown'); break;
      }

      const tokenNetworkData = TokenContract.networks[networkId];

      setAccount(accounts[0]);
      setNetworkId(networkId);

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
            transactionCount: token[8]
         });

         const metadataFile = metadataFiles[i];

         if (!metadataFile.image || metadataFile.image === '') {
            // let's assume that the metadata file hasn't been fully written to IPFS yet
            newToken.image = '';
            newToken.guesses = [];
            newToken.secondsRequired = 0;
            console.log(`Unable to load metadata from ${token.url}`);
         } else {
            newToken.image = metadataFile.image;
            newToken.guesses = metadataFile.attributes.guesses;
            newToken.secondsRequired = metadataFile.attributes.secondsRequired;
         }
         if (account === token.owner) { 
            newToken.marketplaceStatus = token.isForSale ? Entities.TokenStatus.ForSaleByThisAccount : Entities.TokenStatus.NotForSaleByThisAccount;
         } else {
            newToken.marketplaceStatus = token.isForSale ? Entities.TokenStatus.ForSale : Entities.TokenStatus.NotForSale;
         }

         newTokens.push(newToken);
      }

      newTokens.sort(function (a, b) { return b.price - a.price || a.solution.localeCompare(b.solution) });
      setTokens(newTokens, configSettings.tokenCacheTimeout);
      
      return newTokens;
   }

   const updateToken = async (token: Entities.Token): Promise<Entities.Token[]> => {
      let newTokens = [...tokens];      
      const index = newTokens.findIndex(object => { return object.id === token.id; });

      if (index === -1) {
         return tokens;
      }

      newTokens[index] = token;
      setTokens(newTokens, configSettings.tokenCacheTimeout);
      
      return newTokens;
   }

   const callContractMethod = async (func: Function, token: Entities.Token, onStarted: Function, onFinished: Function) => {
      func()
      .on('transactionHash', (hash) => {
         if (token != null) {
            token.marketplaceStatus = Entities.TokenStatus.Transacting;
            updateToken(token);
         }
   
         setTransactionStatus(Entities.TransactionStatus.Active);            
         onStarted(Entities.TokenStatus.Transacting);
      })
      .on('confirmation', (confirmationNumber, receipt) => {
         if (confirmationNumber === 1) {
            setTransactionStatus(Entities.TransactionStatus.Inactive);
            onFinished();               
         }
      })
      .on('error', (error) => {
         setTransactionStatus(Entities.TransactionStatus.Error);
         console.log(error);
      })
      .then((receipt) => {                        
      });
   }

   const mintToken = async (solution: string, guessResults: string[], secondsRequired: number, onStarted: Function, onFinished: Function) => {
      const image = await pinFileToIpfs(`/solutions/${solution}.png`);
      const metadata: any = {
         name: solution,
         description: `Ethordle NFT - ${solution}`,
         image: image,
         attributes: {
            secondsRequired: secondsRequired,
            guesses: guessResults
         }
      };

      const metadataUrl = await pinJsonToIpfs(metadata);
      metadata.url = metadataUrl;

      await callContractMethod(() => 
         contract.methods
            .mint(account, solution, metadataUrl, configSettings.contractPassword)
            .send({ from: account, value: Web3.utils.toWei(initialTokenPrice.toString(), 'ether') }),
         null,
         onStarted,
         () => { getTokens(); onFinished(); }
      );

      await getTokens();
   }

   const buyToken = async (token: Entities.Token, price: number, onStarted: Function, onFinished: Function) => {
      var wei = Web3.utils.toWei(price.toString(), 'ether');

      await callContractMethod(() => 
         contract.methods
            .buy(token.id, configSettings.contractPassword)
            .send({ from: account, value: wei }),
         token,
         onStarted,
         onFinished
      );
   }

   const transferTokenAsContractOwner = async (token: Entities.Token, toAddress: string, onStarted: Function, onFinished: Function) => {      
      await callContractMethod(() => 
         contract.methods
            .transferAsContractOwner(token.id, toAddress)
            .send({ from: account }),
         token,
         onStarted,
         onFinished
      );
   }

   const allowTokenSale = async (token: Entities.Token, price: number, onStarted: Function, onFinished: Function) => {
      var wei = Web3.utils.toWei(price.toString(), 'ether');

      await callContractMethod(() => 
         contract.methods
            .createSale(token.id, wei)
            .send({ from: account }),
         token,
         onStarted,
         onFinished
      );
   }

   const preventTokenSale = async (token: Entities.Token, onStarted: Function, onFinished: Function) => {
      await callContractMethod(() => 
         contract.methods
            .cancelSale(token.id)
            .send({ from: account }),
         token,
         onStarted,
         onFinished
      );
   }

   const explorerAddress = (path: string) : string => {
      let base = '';

      switch (networkId) {
         case 1: base = 'https://etherscan.io/'; break;
         case 3: base = 'https://ropsten.etherscan.io/'; break;
         case 4: base = 'https://rinkeby.etherscan.io/'; break;
         case 5: base = 'https://goerli.etherscan.io/'; break;
         case 42: base = 'https://kovan.etherscan.io/'; break;
         case 5777: base = ''; break;      
         default: base = ''; break;
      }

      if (base == '') {
         return null;
      }
      else {
         return `${base}${path}`;
      }
   }

   return (
      <CryptoContext.Provider value={{
         blockchainStatus,
         transactionStatus,
         initialTokenPrice,
         priceEscalationRate,
         royaltyRate,
         account,
         isContractOwner,
         contract,
         networkName,
         validateBlockchain,
         mintToken,
         buyToken,
         transferTokenAsContractOwner,
         allowTokenSale,
         preventTokenSale,
         tokens,
         getTokens,
         updateToken,
         explorerAddress
      }}>{children}</CryptoContext.Provider>
   )
}

export const useCrypto = (): ContextInterface => {
   const { blockchainStatus, transactionStatus } = useContext(CryptoContext);
   const { initialTokenPrice, priceEscalationRate, royaltyRate } = useContext(CryptoContext);
   const { account } = useContext(CryptoContext);
   const { contract, networkName } = useContext(CryptoContext);
   const { validateBlockchain } = useContext(CryptoContext);
   const { mintToken, buyToken, transferTokenAsContractOwner } = useContext(CryptoContext);
   const { allowTokenSale, preventTokenSale } = useContext(CryptoContext);
   const { tokens, getTokens, updateToken } = useContext(CryptoContext);
   const { isContractOwner } = useContext(CryptoContext);
   const { explorerAddress } = useContext(CryptoContext);

   return {
      blockchainStatus,
      transactionStatus,
      initialTokenPrice,
      priceEscalationRate,
      royaltyRate,
      account,
      isContractOwner,
      contract,
      networkName,
      validateBlockchain,
      mintToken,
      buyToken,
      transferTokenAsContractOwner,
      allowTokenSale,
      preventTokenSale,
      tokens,
      getTokens,
      updateToken,
      explorerAddress
   };
}

