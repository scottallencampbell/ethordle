import { url } from "inspector";
import { useEffect } from "react";
import * as Entities from '../model/entities';

interface ITokenList {
   tokens: Entities.TokenMetadata[],
   account: string,
   buyToken: Function
}

export const TokenList = ({ tokens, account, buyToken }: ITokenList) => {

   useEffect(() => {
      setTimeout(() => {
         document.querySelectorAll('#token-list img').forEach(e => {
            // @ts-ignore
            if (!e.complete) {
               e.setAttribute('src', '/image-not-available.png');
            }
         });
      }, 2000);
   });

   return (
      <div id='token-list'>
         {
            tokens.map((token, i) => (
               <div className='token' key={`${i}`}>
                  <img src={token.imageUrl}></img>          
                  <div className='links'>
                     <strong title='Metadata' onClick={() => window.open(token.url)} className='material-icons smaller'>&#xe54e;</strong>
                     <strong title='Image' onClick={() => window.open(token.imageUrl)} className='material-icons'>&#xea10;</strong>
                     <strong title='Owner' onClick={() => window.open(token.owner)} className='material-icons'>&#xe7fd;</strong>
                  </div>
                  <div className='details'>                    
                     <div className='details-column'>
                        <div className='seconds'>
                           <p>Time to solve</p>
                           <strong>{token.secondsRequired}s</strong>
                        </div>
                        <div className='guess-result'>
                           <p>Guesses</p>
                           <strong>
                              {token.guesses.map((guess, j) => (
                                 <div key={`${i}-${j}`}>
                                    {guess.split('').map((letter, k) => (
                                       <span key={`${i}-${j}-${k}`} className={letter}> </span>
                                    ))}
                                 </div>
                              ))}
                           </strong>
                        </div>
                     </div>
                     <div className='details-column'>
                        <div className={`price price-length-${token.price.toString().length}`}>
                           <p>Current Price</p>
                           <strong><img className='ethereum-icon' src='/ethereum-icon.png'></img> {token.price}</strong>
                        </div>                              
                        <div className='buy'>                           
                           { (token.owner != account) ? 
                           <button id='buy-token' className='material-button' role='button' onClick={() => buyToken(token.id, token.price)}><span className='material-icons md-18'>&#xe854;</span>Purchase</button>
                           : 
                           <button id='owned-token' className='material-button' disabled role='button'><span className='material-icons md-18'>&#xef76;</span>Owned</button>
                           }
                        </div>
                     </div>
                  </div>
               </div>
            ))}
      </div>
   )
}
