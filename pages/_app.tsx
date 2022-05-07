import '../styles/global.css';
import '../styles/tokens.css';
import '../styles/toggle.css';
import '../styles/button.css';

import { CryptoProvider } from '../contexts/useCrypto';
import { useEffect } from 'react';

function Ethordle({ Component, pageProps }) {
   
   useEffect(() => {
      // it makes no sense, but when rendering on an iPhone, html/body get set to 390px, when they should be 480px

      var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      
      if (width < 600) {
         document.body.style.width = `${width}px`;
      }

   }, []);

   return (
      <CryptoProvider>
       <Component {...pageProps} />
      </CryptoProvider>
   )
}

export default Ethordle
