import { useEffect, useState } from 'react';
import { useCrypto } from '../contexts/useCrypto';
import Link from 'next/link';
import { Introduction } from './Introduction';
import { StaticGridRow } from './StaticGridRow';

import * as Entities from '../models/entities';
interface IStatusBar {  
}

export const StatusBar = ({} : IStatusBar) => {
   const { account } = useCrypto();
   const { gameMode } = useCrypto();

   const [isIntroductionPopupOpen, setIsIntroductionPopupOpen] = useState(false);
   const [path, setPath] = useState('');

   useEffect(() => {
      setTimeout(() => {
         document.getElementById('logo').classList.add('flippable');
      }, 1000);         
      
      setPath(window.location.href);

   }, [gameMode]);

   return (
      <>
         <div id='top-bar'>         
            <div id='logo'>
               <StaticGridRow word='E' statusMap='X'></StaticGridRow>               
            </div>
            { gameMode != Entities.GameMode.Unknown ?   
            <>
            <div className='menu-items'>  
               { path.endsWith('/') ? <a onClick={() => window.location.href='/'}>New game</a> : <Link href='/'>New game</Link> }
               { gameMode == Entities.GameMode.Blockchain ?
               <>
                  <Link href='/tokens'>My tokens</Link>        
                  <Link href='/marketplace'>Marketplace</Link> 
               </> : <></>                 
               }
               <a onClick={() => setIsIntroductionPopupOpen(true)}>About</a>            
            </div>
            <div className='account'><a onClick={() => window.open(`https://etherscan.io/address/${account}`)}>{account}</a></div>
            </>           
            : <></> }
         </div>   
         <Introduction isIntroductionPopupOpen={isIntroductionPopupOpen} setIsIntroductionPopupOpen={setIsIntroductionPopupOpen}></Introduction>      
      </>
   )
}