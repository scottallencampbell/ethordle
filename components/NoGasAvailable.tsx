import React, { useRef } from 'react';
import Popup from 'reactjs-popup';
import { useCrypto } from '../contexts/useCrypto';

interface INoGasAvailable {   
   isNoGasAvailablePopupOpen: boolean,
   setIsNoGasAvailablePopupOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const NoGasAvailable = ({isNoGasAvailablePopupOpen, setIsNoGasAvailablePopupOpen} : INoGasAvailable) => {
  
   const { account } = useCrypto();
   
   return (
      <Popup modal open={isNoGasAvailablePopupOpen} closeOnDocumentClick={true} closeOnEscape={true} contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {() => (
            <div id='no-gas-available' className='modal'>  
            <div className='popup-title'>No gas available</div>
            <a className='close' onClick={() => setIsNoGasAvailablePopupOpen(false)}>&times;</a>
            <div className='content'>                        
               <p>Your Ethereum account appears to have insufficient funds to power transactions on the blockchain.</p>
               <p>Please deposit additional ether into account {account}.</p>               
            </div>
         </div>
         )}
      </Popup>
   )
}