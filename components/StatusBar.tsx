import { useEffect } from "react";
import * as Entities from '../model/entities';
import { useCrypto } from '../context/useCrypto';

interface IStatusBar { 
}

export const StatusBar = ({} : IStatusBar) => {
   const { ownerTokens } = useCrypto(); 
   const { account  } = useCrypto();
 
   return (
      <div className='top-bar'>
         <div className='token-count'>NFTs earned: {ownerTokens ? <a href='/tokens'>{ownerTokens.length}</a> : null}</div>
         <div className='account'>{account}</div>
      </div>   
   )
}