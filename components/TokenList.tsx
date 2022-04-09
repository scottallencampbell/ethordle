import { useEffect } from "react";
import * as Entities from '../model/entities';

interface ITokenList {
   tokens: Entities.TokenMetadata[]
}

export const TokenList = ({ tokens }: ITokenList) => {
   return (   
   <div id='token-list'>
      <div className='title'>Token List</div> {
      tokens.map((token, i) => (
         <div key={`${i}`}>
         <div><img src={token.image} /></div>
         <div className='guess-result'>
         {token.guesses.map((guess, j) => (
            <div key={`${i}-${j}`}>
            {guess.split('').map((letter, k) => (
               <span key={`${i}-${j}-${k}`} className={letter}> </span>
            ))}   
            </div>
         ))}
         </div>
         </div>
      ))}
   </div>
   )
}