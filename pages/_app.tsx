import '../styles/global.css';
import '../styles/tokens.css';
import '../styles/toggle.css';
import '../styles/button.css';
import '../styles/responsive.css';

import { CryptoProvider } from '../contexts/useCrypto';
import React from 'react';

function Ethordle({ Component, pageProps }) {
   
   return (
      <CryptoProvider>
       <Component {...pageProps} />
      </CryptoProvider>
   )
}

export default Ethordle
