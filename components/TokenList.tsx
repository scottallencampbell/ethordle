import { url } from "inspector";
import { useEffect } from "react";
import * as Entities from '../model/entities';

interface ITokenList {
   tokens: Entities.TokenMetadata[]
}

export const TokenList = ({ tokens }: ITokenList) => {

   useEffect(() => {
      setTimeout(() => {
         document.querySelectorAll('#token-list img').forEach(e => {
            // @ts-ignore
            if (!e.complete) {
               e.setAttribute('src', '');
            }
         });
      }, 2000);
   });

   return (
      <div id='token-list'>
         <div className='title'>Token List</div> {
            tokens.map((token, i) => (
               <div className='token' key={`${i}`} style={{ backgroundImage: `url(${token.imageUrl})` }}>
                  <div className='details'>
                     <div className='metadata-url'>{token.url}</div>                     
                     <div className='price'>
                        <img className='ethereum-icon' src='/ethereum-icon.png'></img>
                        <span>{token.price}</span>
                        <span>{token.secondsRequired}s</span>
                     </div>
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
               </div>
            ))}
      </div>
   )
}