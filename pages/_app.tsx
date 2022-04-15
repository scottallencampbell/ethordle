import '../styles/global.css';
import { CryptoProvider } from '../context/useCrypto';

function Ethordle({ Component, pageProps }) {
   return (
      <CryptoProvider>
       <Component {...pageProps} />
      </CryptoProvider>
   )
}

export default Ethordle