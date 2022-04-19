import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Web3 from 'web3';
import { useCrypto } from '../context/useCrypto';
import { TokenList } from '../components/TokenList';
import { Title } from '../components/Title';
import { StatusBar } from '../components/StatusBar';

import * as Entities from '../model/entities';
import configSettings from '../config.json';

const Tokens = () => {
   const [ connected, setConnected ] = useState(false);
   const [ allTokens, setAllTokens ] = useState(false);

   const { connectToBlockchain } = useCrypto();  
   const { account } = useCrypto();
   const { ownerTokens, getOwnerTokens } = useCrypto();
   const { getAllTokens} = useCrypto();
   const { contract,  } = useCrypto();
  
   useEffect(() => {
      (async () => {         
         const isConnected = await connectToBlockchain();
         setConnected(isConnected);
      })();
   }, []);

   useEffect(() => {
      (async () => {         
         if (connected) {
            const allMintedTokens = await getAllTokens();        
            setAllTokens(allMintedTokens);
         }
      })();
   }, [connected]);

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
         {account === '' ? null : <StatusBar></StatusBar>}
         <div>
         <Title title='Marketplace'></Title>
         {account === '' || !allTokens ? null : <TokenList account={account} tokens={allTokens} buyToken={buyToken}></TokenList>}
         </div>
      </>
   )
}

export default Tokens;
