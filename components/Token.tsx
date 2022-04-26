import { useEffect, useState } from 'react';
import { Toggle } from './Toggle';
import * as Entities from '../model/entities';
import { useCrypto } from '../context/useCrypto';

interface IToken {
   token: Entities.Token,
   index: number
}

export const Token = ({ token, index }: IToken) => {
   const { buyToken } = useCrypto();
   const { toggleTokenIsForSale } = useCrypto();
   const { account } = useCrypto();
   
   const [isForSale, setIsForSale] = useState(token.isForSale);

   const toggle = () => {
      token.isForSale = !token.isForSale;
      setIsForSale(token.isForSale);    

      toggleTokenIsForSale(token.id, token.isForSale);
   }
   
   return (
      <div className={`token ${token.imageUrl == '' ? 'no-metadata' : ''}`} key={`token-${index}`}>
         <img src={token.imageUrl == '' ? '/metadata-not-available.png' : token.imageUrl}></img>
         <div className='solution-temporary'>{token.solution}</div>
         <div className='disclaimer-metadata'>This token's metadata is currently being saved to the blockchain. Please wait 10 minutes and refresh your browser.</div>
         <div className='disclaimer-image'>This token's image is currently being saved to the blockchain. Please wait 10 minutes and refresh your browser.</div>
         <div className='links'>
            <strong title='Metadata' onClick={() => window.open(token.url)} className='material-icons smaller'>&#xe54e;</strong>
            <strong title='Image' onClick={() => window.open(token.imageUrl)} className='material-icons'>&#xea10;</strong>
            <strong title='Owner' onClick={() => window.open(`https://etherscan.io/address/${token.owner}`)} className='material-icons'>&#xe7fd;</strong>
         </div>
         <div className='details'>        
            <div className='details-column'>
               <div className='solution'>
                  <p>Solution</p>
                  <strong>{token.solution}</strong>                                       
               </div>
               <div className='guess-result'>
                  <p>Guesses</p>
                  <strong>
                     {token.guesses.map((guess, j) => (
                        <div key={`token-${index}-${j}`}>
                           {guess.split('').map((letter, k) => (
                              <span key={`token-${index}-${j}-${k}`} className={letter}> </span>
                           ))}
                        </div>
                     ))}
                  </strong>
               </div>
               <div className='seconds'>
                  <p>Time to solve</p>
                  <strong>{token.secondsRequired}s</strong>
               </div>                                                                      
            </div>
            <div className='details-column'>
               <div className={`price price-length-${token.price.toString().length}`}>
                  <p>Current Price</p>
                  <strong><img className='ethereum-icon' src='/ethereum-icon.png'></img> {token.price}</strong>
               </div>
               <div className='clear'></div>   
               <div className='last-transaction'>
                  <p>Last transaction</p>
                  <strong>{token.lastTransactionTimestamp}</strong>
               </div>               
               <div className='for-sale-status'>
                  {(token.owner == account ) ?
                  <Toggle id={`toggle-${token.id}}`} isOn={token.isForSale} handleToggle={() => toggle() } onText='For sale' offText='Not for sale' />
                  :
                  <></>
                  }
               </div>
               <div className='buy'>
                  {(token.owner != account) ?
                     token.isForSale ? 
                        <button id='buy-token' className='material-button' role='button' onClick={() => buyToken(token.id, token.price)}><span className='material-icons md-18'>&#xe854;</span>Purchase</button>
                        :
                        <button id='not-for-sale-token' className='material-button' disabled role='button'><span className='material-icons md-18'>&#xe897;</span>Not for Sale</button>                                             
                     : token.isForSale ?                                           
                        <button id='for-sale-token' className='material-button' disabled role='button'><span className='material-icons md-18'>&#xef76;</span>For sale</button>
                     :
                        <button id='owned-token' className='material-button' disabled role='button'><span className='material-icons md-18'>&#xe897;</span>Not for sale</button>
                  }
               </div>
            </div>
         </div>.
      </div>
   )
}
