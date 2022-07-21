import React, { useRef } from 'react';
import Popup from 'reactjs-popup';

interface IConnectionTimeout {   
   isConnectionTimeoutPopupOpen: boolean | null,
   setIsConnectionTimeoutPopupOpen: React.Dispatch<React.SetStateAction<boolean | null>>
}

export const ConnectionTimeout = ({isConnectionTimeoutPopupOpen, setIsConnectionTimeoutPopupOpen} : IConnectionTimeout) => {
   const closePopup = () => {
      document.getElementsByClassName('popup-overlay')[0].classList.add('fade-away');
      setTimeout(() => setIsConnectionTimeoutPopupOpen(false), 1000);
   }

   return (
      <Popup modal open={isConnectionTimeoutPopupOpen ?? false} closeOnDocumentClick={true} closeOnEscape={true} contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {() => (
            <div id='connection-timeout' className='modal'>  
            <div className='popup-title'>Metamask failed to open</div>
            <a className='close' onClick={closePopup}>&times;</a>
            <div className='content'>                        
               <p>The Metamask login did not open as expected.</p>
               <p>Please try reloading this page or clicking on the Metamask extension to login.</p>               
            </div>
         </div>
         )}
      </Popup>
   )
}