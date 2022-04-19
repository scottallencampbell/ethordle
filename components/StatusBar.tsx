import { useEffect } from "react";
import * as Entities from '../model/entities';
import { useCrypto } from '../context/useCrypto';

interface IStatusBar { 
}

export const StatusBar = ({} : IStatusBar) => {
   const { tokens } = useCrypto(); 
   const { account } = useCrypto();
 
   const ownerTokenCount = tokens.filter((token) => token.owner == account).length;

   return (
      <>
      { account != '' ? 
      <div className='top-bar'>
         <div className='token-count'>NFTs owned: {tokens ? <a href='/tokens'>{ownerTokenCount}</a> : null}</div>
         <div className='account'>{account}</div>
      </div>   
      : <></> 
      }
      </>
   )
}