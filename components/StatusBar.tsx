import { useEffect } from "react";

interface IStatusBar {
   account: string,
   tokens: string[]
}

export const StatusBar = ({ account, tokens }: IStatusBar) => {

   return (
      <div className='top-bar'>
         <div className='token-count'>NFTs earned: {tokens ? <a href='/tokens'>{tokens.length}</a> : null}</div>
         <div className='account'>{account}</div>
      </div>   
   )
}