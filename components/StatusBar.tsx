import { useEffect } from "react";

interface IStatusBar {
   account: string,
   tokenCount: number
}

export const StatusBar = ({ account, tokenCount }: IStatusBar) => {

   return (
      <div className='top-bar'>
         <div className='token-count'>NFTs earned: <a href='/tokens'>{tokenCount}</a></div>
         <div className='account'>{account}</div>
      </div>   
   )
}