import { useEffect } from "react";
import * as Entities from '../model/entities';

interface IStatusBar {
   account: string,
   tokens: Entities.TokenMetadata[]
}

export const StatusBar = ({ account, tokens }: IStatusBar) => {

   return (
      <div className='top-bar'>
         <div className='token-count'>NFTs earned: {tokens ? <a href='/tokens'>{tokens.length}</a> : null}</div>
         <div className='account'>{account}</div>
      </div>   
   )
}