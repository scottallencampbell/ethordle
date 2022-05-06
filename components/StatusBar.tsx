import { useEffect, useState } from 'react';
import { useCrypto } from '../contexts/useCrypto';
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
   const [path, setPath] = useState('');

   useEffect(() => {
      setTimeout(() => {
         document.getElementById('logo').classList.add('flippable');
      }, 1000);         
      
      setPath(window.location.href);

   }, [isBlockchainConnected]);

   return (
      <>
         <div id='top-bar'>         
            <div id='logo'>
               <StaticGridRow word='E' statusMap='X'></StaticGridRow>               
            </div>
            { isBlockchainConnected ?   
            <>
            <div className='menu-items'>   
               { path != '/' ? <Link href='/'>New game</Link> : <a onClick={() => window.location.href='/'}>New game</a> }
               <Link href='/tokens'>My tokens</Link>        
               <Link href='/marketplace'>Marketplace</Link>                  
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