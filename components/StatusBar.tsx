import { useEffect } from "react";
import * as Entities from '../model/entities';
import { useCrypto } from '../context/useCrypto';

interface IStatusBar { 
}

export const StatusBar = ({} : IStatusBar) => {
   const { tokens } = useCrypto(); 
   const { account } = useCrypto();

   return (
      <>
      { account != '' && tokens != null ? 
      <div className='top-bar'>         
         <div className='token-count'>NFTs owned: <a href='/tokens'>{tokens.length}</a></div>
         <div className='account'>{account}</div>
      </div>   
      : <></> 
      }
      </>
   )
}