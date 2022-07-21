import React, { useRef, useState } from 'react';
import Cookies from 'js-cookie';
import Popup from 'reactjs-popup';
import { Toggle } from './Toggle';

interface IMintingInProgressPopupOpen {   
   isMintingInProgressPopupOpen: boolean | null,
   setIsMintingInProgressPopupOpen: React.Dispatch<React.SetStateAction<boolean | null>>,
   hideMinintingInProgressCookieName: string
}

export const MintingInProgress = ({isMintingInProgressPopupOpen, setIsMintingInProgressPopupOpen, hideMinintingInProgressCookieName} : IMintingInProgressPopupOpen) => {  
   const [isHidePopupToggleOn, setIsHidePopupToggleOn] = useState(false);
   
   const closePopup = () => {
      document.getElementsByClassName('popup-overlay')[0].classList.add('fade-away');
      setTimeout(() => setIsHidePopupToggleOn(false), 1000);
   }

   const handleToggle = async () => {     
      if (isHidePopupToggleOn) {
         Cookies.remove(hideMinintingInProgressCookieName, 0);        
      } else {
         Cookies.set(hideMinintingInProgressCookieName, 'true');
      }

      setIsHidePopupToggleOn(!isHidePopupToggleOn);
   }

   return (
      <Popup modal open={isMintingInProgressPopupOpen ?? false} closeOnDocumentClick={true} closeOnEscape={true} contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {() => (
            <div id='minting-in-progress' className='modal'>  
            <div className='popup-title'>Minting in progress</div>
            <a className='close' onClick={closePopup}>&times;</a>
            <div className='content'>                        
               <p>Congratulations!  Your Ethordle NFT is currently being minted on the blockchain.</p>
               <p>The flashing yellow dot on the right side of the status bar indicates that the transaction is in progress.  Once the dot returns to green, your token will appear on the My Tokens page.</p>               
               <p>Feel free to play another game while you wait!</p>    
               <div className='hide-popup-chooser'>
                  <div className='hide-popup-text'>Hide this notification in the future?</div>
                  <div className='toggle-small'>
                     <Toggle id='hide-popup' isOn={isHidePopupToggleOn} handleToggle={handleToggle} onText='Yes' offText='No' disabled={false}></Toggle>
                  </div>
               </div>
            </div>            
         </div>
         )}
      </Popup>
   )
}