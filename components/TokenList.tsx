import { useEffect } from "react";
import * as Entities from '../model/entities';

interface ITokenList {
   tokens: Entities.TokenMetadata[]
}

export const TokenList = ({ tokens }: ITokenList) => {
   return (   
   <div id='token-list'>
      <div className='title'>Token List</div> {
      tokens.map(token => (
         <>
         <div><img src={token.image} /></div>
         <div className='guess-result'>
         {token.guesses.map(guess => (
            <div>
            {guess.split('').map(letter => (
               <span className={letter}> </span>
            ))}   
            </div>
         ))}
         </div>
         </>
      ))}
   </div>
   )
}