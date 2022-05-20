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
         }, 1000);
      }      
   }, [isIntroductionPopupOpen]);

   const closePopup = () => {
      document.getElementsByClassName('popup-overlay')[0].classList.add('fade-away');
      setTimeout(() => setIsIntroductionPopupOpen(false), 1000);
   }

   return (
      <Popup modal open={isIntroductionPopupOpen} closeOnDocumentClick={false} closeOnEscape={false} contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {() => (
            <div id='intro' className='modal'>
               <div className='popup-title'>Introducing Ethordle</div>
               <a className='close' onClick={closePopup}>&times;</a>
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
                  <hr className='no-top-margin'></hr>  
                  <p>If your browser is connected to the Ethereum network -- and you guess the correct word -- you can mint an NFT for that solution and even trade it on the Ethordle token marketplace.</p>
                  <p>{ initialTokenPrice === 0 ? 
                     <><strong>Minting the token is free</strong>, but you&apos;ll pay a certain amount of eth for gas.  Minting ERC721 tokens can be expensive, and the gas price will vary throughout the day.</> :
                     <>The cost to mint the token is <strong>{initialTokenPrice} eth</strong>, plus gas fees.</>
                  }  If you choose to sell your NFT on the marketplace, <strong>the minimum price is {priceEscalationRate - 100}% above the previous transaction value</strong>, though you can also increase the list price above that minimum.</p>
                  <p>Please note that <strong>this contract will deduct a {royaltyRate}% royalty</strong> from the proceeds when your token sells.</p>                               
               </div>
            </div>
         )}
      </Popup>
   )
}

