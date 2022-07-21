import React from 'react';
import { useEffect, useState } from 'react';
import { useCrypto } from '../contexts/useCrypto';
import Link from 'next/link';
import { Introduction } from './Introduction';
import { StaticGridRow } from './StaticGridRow';

import * as Entities from '../models/entities';
interface IStatusBar {  
}

let nullBoolean : boolean | null;

export const StatusBar = ({} : IStatusBar) => {
   const { account, networkName } = useCrypto();
   const { blockchainStatus, transactionStatus } = useCrypto();
   const { explorerAddress } = useCrypto();

   const [isIntroductionPopupOpen, setIsIntroductionPopupOpen] = useState(nullBoolean);
   const [path, setPath] = useState('');

   useEffect(() => {
      setTimeout(() => {
         document.getElementById('logo')?.classList.add('flippable');
      }, 1000);         
      
      setPath(window.location.href);

   }, [blockchainStatus]);

   return (
      <>
         <div id='status-bar'>         
            <div id='logo'>
               <StaticGridRow word='E' statusMap='X'></StaticGridRow>               
            </div>
            { blockchainStatus !== Entities.BlockchainStatus.Unknown ?   
            <>
            <div className='menu-items'>  
               { path.endsWith('/') ? <a onClick={() => window.location.href='/'}>New game</a> : <Link href='/'>New game</Link> }
               { blockchainStatus === Entities.BlockchainStatus.Connected ?
               <>
                  <Link href='/tokens'>My tokens</Link>        
                  <Link href='/marketplace'>Marketplace</Link> 
               </> : <></>                 
               }
               <a className={`about ${blockchainStatus === Entities.BlockchainStatus.Connected ? 'hide-on-small' : ''} `} onClick={() => setIsIntroductionPopupOpen(true)}>About</a>            
            </div> 
            { account?.length > 10 ?           
            <div className='account hide-on-small'><span className={`status-dot ${transactionStatus}`}></span><a onClick={() => window.open(explorerAddress(`address/${account}`))}>{networkName} {account.substring(0, 5)}...{account.substring(account.length - 4)}</a></div>
            : <></>
            }
            </>           
            : <></> }
         </div>   
         <Introduction isIntroductionPopupOpen={isIntroductionPopupOpen} setIsIntroductionPopupOpen={setIsIntroductionPopupOpen}></Introduction>      
      </>
   )
}