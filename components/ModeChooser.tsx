import React, { useRef } from 'react';
import Popup from 'reactjs-popup';
import * as Entities from '../model/entities';

interface IModeChooser {   
   setGameMode: React.Dispatch<React.SetStateAction<Entities.GameMode>>,
   isGameModePopupOpen: boolean,
   setIsGameModePopupOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const ModeChooser = ({setGameMode, isGameModePopupOpen, setIsGameModePopupOpen} : IModeChooser) => {
   
   const downloadFile = () => {
      window.location.href = 'https://metamask.io/download/';
   }

   const playDisconnected = () => {
      setGameMode(Entities.GameMode.Disconnected);   
   }

   return (
      <Popup modal open={isGameModePopupOpen} closeOnDocumentClick={false} closeOnEscape={false} contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {() => (
            <div id='mode-chooser' className='modal'>  
            <div className='content'>
               <div className='ethereum-icon'>
                  <img src='/ethordle-to-ethereum-icon.png'></img>
               </div>              
               <p>Welcome to <b>ETHORDLE</b>, an NFT-enabled version of the popular Wordle game.</p>
               <p>Your browser is not currently configured to support Ethereum.</p>
               <p>To enable your browser for Ethereum, download MetaMask using the button below.</p>
               <p>Alternatively, you can play Ethordle while disconnected from the blockchain.  In disconnected mode, of course, you will not receive NFTs.</p>
               <div className='buttons'>
                  <span>
                  <button id='install-metamask' className='material-button' role='button' onClick={downloadFile}>Install MetaMask <img src='/metamask-icon.png'></img></button>
                  </span>
                  <span onClick={() => setIsGameModePopupOpen(false)}>
                  <button id='play-disconnected' className='material-button' role='button' onClick={playDisconnected}>Play Disconnected <img src='/metamask-icon-disabled.png'></img></button>
                  </span>
               </div>
            </div>
         </div>
         )}
      </Popup>
   )
}