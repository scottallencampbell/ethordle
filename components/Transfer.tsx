import React, { useRef, useState } from 'react';
import Popup from 'reactjs-popup';

import * as Entities from '../models/entities';

interface ITransfer {
   token: Entities.Token,
   toAddress: string,
   setToAddress: React.Dispatch<React.SetStateAction<string>>,  
   isTransferPopupOpen: boolean,
   setIsTransferPopupOpen: React.Dispatch<React.SetStateAction<boolean>>,
   handleTransferToken: Function
}

export const Transfer = ({ token, toAddress, setToAddress, isTransferPopupOpen, setIsTransferPopupOpen, handleTransferToken }: ITransfer) => {
   const [errorDetected, setErrorDetected] = useState('');
   
   const handleTransferButtonClick = () => {
      if (toAddress.length != 42) {
         setErrorDetected('invalid-address');
      } else {
         handleTransferToken();
      }
   }

   const handleAddressChange = (event) => {
      setToAddress(event.target.value);
      setErrorDetected('');
   }

   return (
      <Popup modal open={isTransferPopupOpen} closeOnDocumentClick={false} closeOnEscape={false} contentStyle={{ maxWidth: '620px', width: '90%' }} >
         {() => (
            <div id='transfer-token' className={`modal ${errorDetected}`}>
               <div className='popup-title'>Transfer <strong>{token.solution}</strong> to Another Account</div>
               <a className='close' onClick={() => setIsTransferPopupOpen(false)}>&times;</a>
               <div className='content'>
                  <p>Enter the transferee&apos;s ethereum address in the textbox below:</p>
                  <div className='center'>
                     <input type='text' className='address' onChange={handleAddressChange} value={toAddress}></input>
                  </div>
                  <div className='buttons'>
                     <span>
                        <button id='cancel' className='material-button' role='button' onClick={() => setIsTransferPopupOpen(false)}>Cancel</button>
                     </span>
                     <span>
                        <button id='transfer' className='material-button' role='button' onClick={handleTransferButtonClick}>Transfer</button>
                     </span>
                  </div>
               </div>
            </div>
         )}
      </Popup>
   )
}