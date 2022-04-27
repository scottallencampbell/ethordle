import React, { useRef, useState } from 'react';
import Popup from 'reactjs-popup';
import * as Entities from '../model/entities';

interface IPriceChooser {
   isPriceChooserOpen: boolean,
   setIsPriceChooserOpen: React.Dispatch<React.SetStateAction<boolean>>,
   token: Entities.Token,
   newPrice: number,
   setNewPrice: React.Dispatch<React.SetStateAction<number>>,
   handleTokenSetForSale: Function
}

export const PriceChooser = ({ isPriceChooserOpen, setIsPriceChooserOpen, token, newPrice, setNewPrice, handleTokenSetForSale }: IPriceChooser) => {
   const maxPrice = 999.999;
   const maxDecimals = 3;
   const [errorDetected, setErrorDetected] = useState('');

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
         handleTokenSetForSale();
      }
   }

   return (
      <Popup modal open={isPriceChooserOpen} closeOnDocumentClick={false} closeOnEscape={false} contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {() => (
            <div id='price-chooser' className={`modal ${errorDetected}`}>
               <div className='content'>
                  <p>Congratulations, you're about to list your token for sale on the Ethordle marketplace!</p>
                  <p>Accept the sale price shown below or enter a new, higher value. <span className='minimum-value'>The sale price cannot be less than {token.price} eth.</span></p>
                  <p>Please note that the Ethordle contract will deduct a 99% royalty from the seller on every transaction.</p>
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