import { useEffect } from 'react';
import Popup from 'reactjs-popup';
import { useCrypto } from '../contexts/useCrypto';
import { StaticGridRow } from './StaticGridRow'

interface IIntroduction {   
   isIntroductionPopupOpen: boolean,
   setIsIntroductionPopupOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const Introduction = ({isIntroductionPopupOpen, setIsIntroductionPopupOpen } : IIntroduction) => {
   const { initialTokenPrice, priceEscalationRate, royaltyRate } = useCrypto();
   
   useEffect(() => {
         
      if (isIntroductionPopupOpen) {
         setTimeout(() => {
            document.getElementById('intro').classList.add('flippable');
         }, 500);
      }      
   }, [isIntroductionPopupOpen]);

   return (
      <Popup modal open={isIntroductionPopupOpen} closeOnDocumentClick={false} closeOnEscape={false} contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {() => (
            <div id='intro' className='modal'>
               <div className='popup-title'>Introducing Ethordle</div>
               <a className='close' onClick={() => setIsIntroductionPopupOpen(false)}>&times;</a>
               <div className='content'>
                  <p>Welcome to Ethordle, the NFT-enabled version of the popular Wordle game.</p>
                  <p>Each guess must be a vaid five-letter word.  Hit the Enter button to submit your guess. The color of the tiles will change to show how close your guess was to the solution.</p>
                  <hr></hr>
                  <div id='examples'>
                     <StaticGridRow word={'CHOMP'} statusMap={'X    '}></StaticGridRow>
                     <p>The letter <b>C</b> is in the solution and is in the correct location.</p>
                     <StaticGridRow word={'BLURT'} statusMap={' O   '}></StaticGridRow>
                     <p>The letter <b>L</b> is in the solution but is in the wrong location.</p>
                     <StaticGridRow word={'SPORK'} statusMap={'  -  '}></StaticGridRow>
                     <p>The letter <b>O</b> is not in the solution at any location.</p>
                  </div>
                  <hr></hr>  
                  <p>If your browser is connected to the Ethereum network -- and you guess the correct word -- you can mint an NFT for that solution and optionally list your NFT for sale on the Ethordle marketplace.</p>
                  <p>The current cost to mint an Ethordle NFT is {initialTokenPrice}ETH, plus gas fees.  When you list an NFT on the marketpace, the minimum price is set to {priceEscalationRate - 100}% over the previous transaction value, though you can also increase the list price above that minimum.</p>
                  <p>Please note that the contract will deduct a {royaltyRate}% royalty from the proceeds when your token sells.</p>                               
               </div>
            </div>
         )}
      </Popup>
   )
}
