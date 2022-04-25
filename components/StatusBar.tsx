import { useEffect, useState } from "react";
import * as Entities from '../model/entities';
import { useCrypto } from '../context/useCrypto';
import { GridTile } from './GridTile';
import Link from "next/link";
import { Introduction } from "./Introduction";

interface IStatusBar {  
}

export const StatusBar = ({} : IStatusBar) => {
   const { tokens } = useCrypto(); 
   const { account } = useCrypto();
   const { isBlockchainConnected } = useCrypto();

   const [isIntroductionPopupOpen, setIsIntroductionPopupOpen] = useState(false);

   useEffect(() => {
      if (account != '' && tokens) {
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
            <div id='logo'><GridTile key='logo' tile={{ value: 'E', tileIndex: 0, rowIndex: -1, status: Entities.TileStatus.Correct }}></GridTile></div>
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