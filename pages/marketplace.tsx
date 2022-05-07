import React, { useEffect, useState } from 'react';
import { fulfillWithTimeLimit } from '../services/async';
import { useCrypto } from '../contexts/useCrypto';
import { TokenList } from '../components/TokenList';
import { StatusBar } from '../components/StatusBar';

import configSettings from '../config.json';
import Head from 'next/head';

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
         if (isBlockchainConnected) { return; }         
         const isConnected = await fulfillWithTimeLimit(3000, connectToBlockchain(), false);        
        })();
   }, []);

   useEffect(() => {
      (async () => {            
         if (!isBlockchainConnected) {
            setIsGameModePopupOpen(true);
            return;
         }            
        
         if (tokens === null) {            
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
         if (!isBlockchainConnected || tokens === null) { return; }
      
         setTokensToRender(tokens);
        })();
   }, [tokens, isBlockchainConnected]);

   return (
      <>        
         <Head>
            <title>{configSettings.appName}</title>
         </Head>
         <StatusBar></StatusBar>
         <TokenList isMarketplace={true} title='Marketplace' account={account} tokens={tokensToRender}></TokenList>         
      </>
   )
}

export default Marketplace;
