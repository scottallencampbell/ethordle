import Popup from 'reactjs-popup';
import { StaticGridRow } from './StaticGridRow';
import { useCrypto } from '../contexts/useCrypto';

import * as Entities from '../models/entities';

interface ISummary {
   isSummaryPopupOpen: boolean,
   setIsSummaryPopupOpen: React.Dispatch<React.SetStateAction<boolean>>
   statistics: Entities.Statistics
}

export const Summary = ({ statistics, isSummaryPopupOpen, setIsSummaryPopupOpen } : ISummary) => {
   const { blockchainStatus, initialTokenPrice } = useCrypto();
   
   const closePopup = () => {
      document.getElementsByClassName('popup-overlay')[0].classList.add('fade-away');
      setTimeout(() => setIsSummaryPopupOpen(false), 1000);
   }

   return (
      <Popup modal open={isSummaryPopupOpen} closeOnDocumentClick={false} closeOnEscape={true} contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {() => (        
            <div id='summary' className='modal'>
               <a className='close' onClick={closePopup}>&times;</a>
               <div className='content'>
                  <p className='header'>Solution</p>
                  <div className='summary-row'>
                  <StaticGridRow word={statistics.solution} statusMap={'X'.repeat(statistics.solution.length)}></StaticGridRow>      
                  </div>            
                  { blockchainStatus === Entities.BlockchainStatus.Connected ? 
                     <>
                     <div>
                       <p className='header'>Mint an NFT for this solution</p>
                        <div className='mint-nft'>
                           Please accept the Metmask popup to mint an Ethordle NFT for <strong>{statistics.solution}</strong>.  You&apos;ll have a permanent Ethereum blockchain asset to prove your accomplishment!<br/><br/>
                           Once you&apos;ve minted your NFT, you can put your asset on sale on the Ethordle marketplace.  Maybe that five-letter word will buy you a Lambo?<br/><br/>
                           { initialTokenPrice === 0 ? 
                              <><strong>Minting the token is free</strong>, but you&apos;ll pay a certain amount of eth for gas.  Minting ERC721 tokens can be expensive, and the gas price will vary throughout the day.</> :
                              <>The cost to mint the token is <strong>{initialTokenPrice} eth</strong>, plus gas fees.</>
                           }
                        </div>
                     </div>
                     </> : <></>
                  }                
                  <p className='header'>Statistics</p>
                  <div id='statistics'>
                     <div>
                        <p>{statistics.gamesPlayed}</p>
                        <label>Played</label>
                     </div>
                     <div>
                        <p>{statistics.gamesWon}</p>
                        <label>Won</label>
                     </div>                    
                     <div>
                        <p>{statistics.streak}</p>
                        <label>Current streak</label>
                     </div>     
                     <div>
                        <p>{statistics.averageGuesses}</p>
                        <label>Ave guesses</label>
                     </div>                 
                  </div>
                  <p className='header'>Winning guess distribution</p>
                  <div id='distribution' className='distribution closed'>
                     {
                        statistics.guesses.map((guess, i) => {
                           const percent = Math.round(100 * guess / statistics.gamesWon);
                           return (
                              <div key={`bar-${i}`} className='chart'>
                                 <span className='number'>{i+1}</span>
                                 <ul className='horiz'>
                                    <li className='bar' style={{ width: percent + '%' }}>
                                       <span className={`label ${percent < 14 ? 'label-outside' : ''}`}>
                                          {percent}%
                                       </span>                                      
                                    </li>      
                                 </ul>
                              </div>                                              
                           )
                        })
                     }                     
                  </div>
               </div>
            </div>
         )}
      </Popup>
   )
}