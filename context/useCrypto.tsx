import { createContext, Dispatch, SetStateAction, useContext, useState } from "react"
import Web3 from 'web3';
import TokenContract from '../abis/EthordleToken.json';

interface ContextInterface {
  account: {
    getAccount: string
    setAccount: Dispatch<SetStateAction<string>>
  },
  contract: {
    getContract: object
    setContract: Dispatch<SetStateAction<object>>
  },
  tokens: {
    getTokens: string[]
    setTokens: Dispatch<SetStateAction<string[]>>
  }
}

declare let window: any;

/**
 * IMPORTANT TIP:
 * 
 * Think that a context in react is like a shop cart on a ecommerce. All data from your cart needs
 * to be loaded in all pages because you can click on your cart any time or see the number of itens on the cart and stuff, so that is why we use context from React.
 */

// React context to be used on wrapping your project in _app.tsx (so all your project will know about this context)
export const CryptoContext = createContext({} as ContextInterface);

/**
 * Create a Provider that receive javascript default children attribute.
 * 
 * children attributes is used for get all wrapped elements inside _app.tsx
 * 
 * In _app.tsx will be something like:
 * <CryptoProvider>
 *  <Component {...pageProps} />
 * </CryptoProvider>
 * 
 * So your "children" will be all your pages code because _app.tsx is where we set all root config from our projects.
 */
export function CryptoProvider({ children }) {

  const [account, setAccount] = useState('');
  const [tokens, setTokens] = useState(null);
  const [contract, setContract] = useState(null);
   
  // You can do logic stuff inside here with your contracts state (like using useEffect and stuff)
  // If you use useEffect here, it will be loaded every time your app loads --> not every page load?
  // --> multiple properties?
  // --> https://blog.agney.dev/useMemo-inside-context/
  // --> https://stackoverflow.com/questions/57840535/passing-multiple-value-and-setter-pairs-to-context-provider-in-react
  // --> https://stackoverflow.com/questions/61281409/react-context-api-with-multiple-values-performance
  // --> All available data needs to be passed inside "value" like we set in our ContextExampleInterface
  // --> https://thewebdev.info/2021/03/14/how-to-use-react-context-api-with-multiple-values-for-providers/

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
       const contract = new web3.eth.Contract(abi, contractAddress);
       setContract(contract);

       console.log('Account: ' + accounts[0]);
       console.log('TokenAddress: ' + contractAddress);
       
       //// todo setGameMode(Entities.GameMode.Blockchain);
    } else {
       window.alert('Smart contract not deployed to a detected network.')
    }
 }

  return (
    <CryptoContext.Provider value={{account: [getAccount, setAccount], contract: [getContract, setContract], tokens: [getTokens, setTokens ]}}>{children}</CryptoContext.Provider>
  )
}


// This is our custom hook that we call on our components or pages.
// Always import it and use like: const { getAccount, setAccount } = useCrypto()
export const useCrypto = ():ContextInterface => {

  const {getAccount, setAccount} = useContext(CryptoContext)
  const {getContract, setContract} = useContext(CryptoContext)
  const {getTokens, setTokens} = useContext(CryptoContext)

  return {{getAccount, setAccount}, {getContract, setContract}, {getTokens, setTokens}};
}
