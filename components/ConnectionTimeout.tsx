import React, { useRef } from 'react';
import Popup from 'reactjs-popup';

interface IConnectionTimeout {   
   isConnectionTimeoutPopupOpen: boolean,
   setIsConnectionTimeoutPopupOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const ConnectionTimeout = ({isConnectionTimeoutPopupOpen, setIsConnectionTimeoutPopupOpen} : IConnectionTimeout) => {
   return (
      <Popup modal open={isConnectionTimeoutPopupOpen} closeOnDocumentClick={true} closeOnEscape={true} contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {() => (
            <div id='connection-timeout' className='modal'>  
            <div className='popup-title'>Metamask failed to open</div>
            <a className='close' onClick={() => setIsConnectionTimeoutPopupOpen(false)}>&times;</a>
            <div className='content'>                        
               <p>The Metamask login did not open as expected.</p>
               <p>Please try reloading this page or clicking on the Metamask extension to login.</p>               
            </div>
         </div>
         )}
      </Popup>
   )
}