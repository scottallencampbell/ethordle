import React, { useRef, useState } from 'react';
import Popup from 'reactjs-popup';
import { useCrypto } from '../contexts/useCrypto';

import * as Entities from '../models/entities';

interface IPriceChooser {
   token: Entities.Token,
   isPriceChooserOpen: boolean,
   setIsPriceChooserOpen: React.Dispatch<React.SetStateAction<boolean>>,
   newPrice: number,
   setNewPrice: React.Dispatch<React.SetStateAction<number>>,
   handleSetTokenForSale: Function,
   solution: string
}

export const PriceChooser = ({ token, isPriceChooserOpen, setIsPriceChooserOpen, newPrice, setNewPrice, handleSetTokenForSale, solution }: IPriceChooser) => {
   const maxPrice = 999.999;
   const maxDecimals = 3;
   const [errorDetected, setErrorDetected] = useState('');
   
   const { royaltyRate } = useCrypto();
   
   const getDecimals = (value) => {
      if (Math.floor(value.valueOf()) === value.valueOf()) return 0;
      const tokens = value.toString().split('.');

      if (tokens.length == 0 || !tokens[1]) { return 0; }
      return tokens[1].length;
   }

   const handlePriceChange = (event) => {
      const { value, min, max } = event.target;
      setNewPrice(value);

      if (value > maxPrice) {
         setErrorDetected('too-high');      
      } else {
         setErrorDetected('');
      }
   };

   const handleOfferForSale = () => {
      if (newPrice > maxPrice) {
         setErrorDetected('too-high');
      } else if (newPrice < token.price) {
         setErrorDetected('too-low');
      } else if (getDecimals(newPrice) > maxDecimals) {
         setErrorDetected('too-many-decimals');
      } else {
         handleSetTokenForSale();
      }
   }

   return (
      <Popup modal open={isPriceChooserOpen} closeOnDocumentClick={false} closeOnEscape={false} contentStyle={{ maxWidth: '620px', width: '90%' }} >
         {() => (
            <div id='price-chooser' className={`modal ${errorDetected}`}>
               <div className='popup-title'>Offer <strong>{solution}</strong> for Sale</div>
               <div className='content'>
                  <p>Congratulations, you&apos;re about to offer your NFT for sale on the Ethordle marketplace!</p>
                  <p>Please note that the contract will deduct a <strong>{royaltyRate}% royalty</strong> from the proceeds when your token sells.  At the price below, a sale of this token will net you <strong>{Math.round((newPrice * (100 - royaltyRate) / 100) * 10000) / 10000} ETH</strong>.</p>
                  <p>Accept the sale price shown below or enter a new, higher value. <span className='minimum-value'>The sale price cannot be less than <strong>{token.price} ETH</strong>.</span></p>
                  <p className='too-many-decimals-alert'>The sale price may not have more than three decimal places.</p>
                  <div className='center'>
                     <input type='number' className='price' min={token.price} onChange={handlePriceChange} value={newPrice}></input>
                  </div>
                  <div className='buttons'>
                     <span>
                        <button id='cancel' className='material-button' role='button' onClick={() => setIsPriceChooserOpen(false)}>Cancel</button>
                     </span>
                     <span>
                        <button id='offer-for-sale' className='material-button' role='button' onClick={handleOfferForSale}>Offer for Sale</button>
                     </span>
                  </div>
               </div>
            </div>
         )}
      </Popup>
   )
}