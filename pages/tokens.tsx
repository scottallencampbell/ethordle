import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Web3 from 'web3';
import { useCrypto } from '../context/useCrypto';
import { TokenList } from '../components/TokenList';

import * as Entities from '../model/entities';
import configSettings from '../config.json';
import { setConstantValue } from 'typescript';

const Tokens = () => {
   const [ connected, setConnected ] = useState(false);
   const { blockchain, connectToBlockchain  } = useCrypto();  // blockchain var is a dummy
   const { account,  } = useCrypto();
   const { tokens, refreshTokens} = useCrypto();
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
            await refreshTokens();
         }
      })();
   }, [connected]);

   return (
      <>
         <Head>
            <title>{configSettings.appName}</title>
            <link rel='icon' href='/favicon.ico'></link>
         </Head>
         <div>
         {account === '' || !tokens ? null : <TokenList tokens={tokens}></TokenList>}
         </div>
      </>
   )
}

export default Tokens;
