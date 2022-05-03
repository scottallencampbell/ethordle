import React, { useRef, useState } from 'react';
import Popup from 'reactjs-popup';
import { useCrypto } from '../context/useCrypto';

import * as Entities from '../model/entities';

interface ITransfer {
   isTransferPopupOpen: boolean,
   setIsTransferPopupOpen: React.Dispatch<React.SetStateAction<boolean>>,
   token: Entities.Token,
   handleTransferToken: Function
}

export const Transfer = ({ isTransferPopupOpen, setIsTransferPopupOpen, token, handleTransferToken }: ITransfer) => {
   const [toAddress, setToAddress] = useState('');
   const [errorDetected, setErrorDetected] = useState('');
   
   const handleTransferButtonClick = () => {
      handleTransferToken();
   }

   const handleAddressChange = () => {
      
   }

   return (
      <Popup modal open={isTransferPopupOpen} closeOnDocumentClick={false} closeOnEscape={false} contentStyle={{ maxWidth: '620px', width: '90%' }} >
         {() => (
            <div id='transfer-token' className={`modal ${errorDetected}`}>
               <div className='popup-title'>Transfer <strong>{token.solution}</strong> to Another Account</div>
               <a className='close' onClick={() => setIsTransferPopupOpen(false)}>&times;</a>
               <div className='content'>
                  <p>Enter the ethereum address below to transfer this token to.</p>
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