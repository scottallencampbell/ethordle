import { useEffect, useState } from 'react';
import { useCrypto } from '../context/useCrypto';
import Link from 'next/link';
import { Introduction } from './Introduction';
import { StaticGridRow } from './StaticGridRow';

interface IStatusBar {  
}

export const StatusBar = ({} : IStatusBar) => {
   const { tokens } = useCrypto(); 
   const { account } = useCrypto();
   const { isBlockchainConnected } = useCrypto();

   const [isIntroductionPopupOpen, setIsIntroductionPopupOpen] = useState(false);

   useEffect(() => {
      if (account != '' && tokens != null) {
         setTimeout(() => {
            document.getElementById('logo').classList.add('flippable');
         }, 1000);         
      }

   }, [isBlockchainConnected]);

   return (
      <>
      { isBlockchainConnected ? 
      <>
         <div className='top-bar'>         
            <div id='logo'>
               <StaticGridRow word='E' statusMap='X'></StaticGridRow>               
            </div>
            <div className='menu-items'>   
               { !window.location.href.endsWith('/') ? <Link href='/'>New game</Link> : <a onClick={() => window.location.href='/'}>New game</a> }
               <Link href='/tokens'>My tokens</Link>        
               <Link href='/marketplace'>Marketplace</Link>                               
               <a onClick={() => setIsIntroductionPopupOpen(true)}>About</a>            
            </div>
            <div className='account'><a onClick={() => window.open(`https://etherscan.io/address/${account}`)}>{account}</a></div>
         </div>   
         <Introduction isIntroductionPopupOpen={isIntroductionPopupOpen} setIsIntroductionPopupOpen={setIsIntroductionPopupOpen}></Introduction>
      </>
      : <></> 
      }
      </>
   )
}