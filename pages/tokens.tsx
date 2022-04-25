import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useCrypto } from '../context/useCrypto';
import { TokenList } from '../components/TokenList';
import { StatusBar } from '../components/StatusBar';

import * as Entities from '../model/entities';
import configSettings from '../config.json';

const Tokens = () => {
   const { isBlockchainConnected, connectToBlockchain } = useCrypto();  
   const { account, contract } = useCrypto();
   const { tokens, getTokens } = useCrypto();
   const { buyToken } = useCrypto();
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
        
         const myTokens = tokens.filter((token) => token.owner == account);
         setTokensToRender(myTokens);
        })();
   }, [tokens]);

   return (
      <>
         <Head>
            <title>{configSettings.appName}</title>
            <link rel='icon' href='/favicon.ico'></link>            
         </Head>
         <StatusBar></StatusBar>
         <TokenList account={account} buyToken={buyToken} tokens={tokensToRender} title='My tokens'></TokenList>         
      </>
   )
}

export default Tokens;
