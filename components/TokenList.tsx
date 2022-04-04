import { useEffect } from "react";

interface ITokenList {
   tokens: string[]
}

export const TokenList = ({ tokens }: ITokenList) => {
   return (
   <div className='token-list'> {
        tokens.map((token) => (
            <div><img src={token} /></div>
      ))
   }
   </div>
   )
}