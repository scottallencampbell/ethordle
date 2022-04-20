import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useCrypto } from '../context/useCrypto';
import { TokenList } from '../components/TokenList';
import { Title } from '../components/Title';
import { StatusBar } from '../components/StatusBar';
import { ModeChooser } from '../components/ModeChooser';

import * as Entities from '../model/entities';
import configSettings from '../config.json';

const Tokens = () => {
   const { connectToBlockchain } = useCrypto();  
   const { account } = useCrypto();
   const { tokens, getTokens } = useCrypto();
   const { gameMode, setGameMode } = useCrypto();
   const { buyToken } = useCrypto();
   
   const [isGameModePopupOpen, setIsGameModePopupOpen] = useState(false);
  
   useEffect(() => {
      (async () => {   
         document.body.classList.add('force-vertical-scrollbar');

         setTimeout(() => {
            document.querySelectorAll('.hidden-on-load').forEach(e => { e.classList.add('visible-after-load') });
         }, 1000);

         const isConnected = await connectToBlockchain();    
         
         if (!isConnected) {
            setIsGameModePopupOpen(true);
         }           
      })();
   }, []);

   return (
      <>
         <Head>
            <title>{configSettings.appName}</title>
            <link rel='icon' href='/favicon.ico'></link>            
         </Head>
         <StatusBar></StatusBar>
         <div>
            <Title title='Marketplace'></Title>
            <div className='hidden-on-load'>
               {account === '' || !tokens ? null : <TokenList account={account} tokens={tokens} buyToken={buyToken}></TokenList>}
            </div>
         </div>
         <ModeChooser setGameMode={setGameMode} isGameModePopupOpen={isGameModePopupOpen} setIsGameModePopupOpen={setIsGameModePopupOpen}></ModeChooser>
      </>
   )
}

export default Tokens;
