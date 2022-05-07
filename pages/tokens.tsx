import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useCrypto } from '../contexts/useCrypto';
import { TokenList } from '../components/TokenList';
import { StatusBar } from '../components/StatusBar';

import * as Entities from '../models/entities';
import configSettings from '../config.json';

const Tokens = () => {
   const { blockchainStatus, validateBlockchain } = useCrypto();
   const { account } = useCrypto();
   const { tokens, getTokens } = useCrypto();
   
   const [isGameModePopupOpen, setIsGameModePopupOpen] = useState(false);
   const [tokensToRender, setTokensToRender] = useState(null);
   
   const fadeElementsIn = () => {
      setTimeout(() => {
         document.querySelectorAll('.hidden-on-load').forEach(e => { e.classList.add('visible-after-load') });
      }, 1000);
   }

   useEffect(() => {
      (async () => {   
         const status = await validateBlockchain();

         switch (status) { 
            case Entities.BlockchainStatus.NoGas:                      
            case Entities.BlockchainStatus.NotConnected:
               setIsGameModePopupOpen(true);
               break;
         }       
      })();
   }, []);

   useEffect(() => {
      (async () => {            
         if (blockchainStatus != Entities.BlockchainStatus.Connected) {
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
   }, [blockchainStatus]);

   useEffect(() => {
      (async () => {            
         if (blockchainStatus != Entities.BlockchainStatus.Connected || tokens == null) { return; }
      
         const myTokens = tokens.filter((token) => token.owner === account);
         setTokensToRender(myTokens);
        })();
   }, [tokens, blockchainStatus]);

   return (
      <>  
         <Head>
            <title>{configSettings.appName}</title>
         </Head>      
         <StatusBar></StatusBar>
         { tokensToRender != null ?
         <TokenList isMarketplace={false} title='My tokens' account={account} tokens={tokensToRender}></TokenList> 
         : <></>
         }
      </>
   )
}

export default Tokens;
