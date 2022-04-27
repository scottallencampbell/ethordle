import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useCrypto } from '../context/useCrypto';
import { TokenList } from '../components/TokenList';
import { StatusBar } from '../components/StatusBar';

import configSettings from '../config.json';

const Marketplace = () => {
   const { isBlockchainConnected, connectToBlockchain } = useCrypto();  
   const { account } = useCrypto();
   const { tokens, getTokens } = useCrypto();
   
   const [isGameModePopupOpen, setIsGameModePopupOpen] = useState(false);
   const [tokensToRender, setTokensToRender] = useState([]);
   
   const fadeElementsIn = () => {
      setTimeout(() => {
         document.querySelectorAll('.hidden-on-load').forEach(e => { e.classList.add('visible-after-load') });
      }, 1000);
   }

   useEffect(() => {
      (async () => {   
         await connectToBlockchain();  
        })();
   }, []);

   useEffect(() => {
      (async () => {            
         if (!isBlockchainConnected) {
            setIsGameModePopupOpen(true);
            return;
         }            
        
         if (tokens == null) {            
            await getTokens();
            fadeElementsIn();
         }
         else {
            fadeElementsIn();
         }
        })();
   }, [isBlockchainConnected]);

   useEffect(() => {
      (async () => {            
         if (!isBlockchainConnected || tokens == null) { return; }
      
         setTokensToRender(tokens);
        })();
   }, [tokens, isBlockchainConnected]);

   return (
      <>
         <Head>
            <title>{configSettings.appName}</title>
            <link rel='icon' href='/favicon.ico'></link>            
         </Head>
         <StatusBar></StatusBar>
         <TokenList isMarketplace={true} title='Marketplace' account={account} tokens={tokensToRender}></TokenList>         
      </>
   )
}

export default Marketplace;
