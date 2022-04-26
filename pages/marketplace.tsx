import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useCrypto } from '../context/useCrypto';
import { TokenList } from '../components/TokenList';
import { StatusBar } from '../components/StatusBar';

import * as Entities from '../model/entities';
import configSettings from '../config.json';

const Marketplace = () => {
   const { isBlockchainConnected, connectToBlockchain } = useCrypto();  
   const { account, contract } = useCrypto();
   const { tokens, getTokens } = useCrypto();
   const { setGameMode } = useCrypto();
   
   const [isGameModePopupOpen, setIsGameModePopupOpen] = useState(false);
   const [tokensToRender, setTokensToRender] = useState([]);

   useEffect(() => {
      (async () => {   
         setTimeout(() => {
            document.querySelectorAll('.hidden-on-load').forEach(e => { e.classList.add('visible-after-load') });
         }, 1000);

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
         }
        })();
   }, [isBlockchainConnected]);

   useEffect(() => {
      (async () => {            
         if (tokens == null) { return; }
      
         setTokensToRender(tokens);
        })();
   }, [tokens]);

   return (
      <>
         <Head>
            <title>{configSettings.appName}</title>
            <link rel='icon' href='/favicon.ico'></link>            
         </Head>
         <StatusBar></StatusBar>
         <TokenList isMarketplace={true} title='Marketplace' account={account} tokens={tokens}></TokenList>         
      </>
   )
}

export default Marketplace;
