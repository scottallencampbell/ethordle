import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Web3 from 'web3';
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
   const { contract } = useCrypto();
   const { tokens } = useCrypto();
   const { gameMode, setGameMode } = useCrypto();
   
   const [isGameModePopupOpen, setIsGameModePopupOpen] = useState(false);
  
   useEffect(() => {
      (async () => {    
         setTimeout(() => {
            document.querySelectorAll('.hidden-on-load').forEach(e => { e.classList.add('visible-after-load') });
         }, 1000);

         const isConnected = await connectToBlockchain();    
         
         if (!isConnected) {
            setIsGameModePopupOpen(true);
         }           
      })();
   }, []);

   const buyToken = async(id: number, price: string) => {
      var price = Web3.utils.toWei(price, 'ether');
      console.log(account, id, price);
      await contract.methods.buy(account, id).send({ from: account, value: price });   
   }

   return (
      <>
         <Head>
            <title>{configSettings.appName}</title>
            <link rel='icon' href='/favicon.ico'></link>            
         </Head>
         <StatusBar></StatusBar>
         <div>
         <Title title='Marketplace'></Title>
         {account === '' || !tokens ? null : <TokenList account={account} tokens={tokens} buyToken={buyToken}></TokenList>}
         </div>
         <ModeChooser setGameMode={setGameMode} isGameModePopupOpen={isGameModePopupOpen} setIsGameModePopupOpen={setIsGameModePopupOpen}></ModeChooser>
      </>
   )
}

export default Tokens;
