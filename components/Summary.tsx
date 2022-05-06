import * as Entities from '../models/entities';

import Popup from 'reactjs-popup';
import { StaticGridRow } from './StaticGridRow';

interface ISummary {
   isSummaryPopupOpen: boolean,
   setIsSummaryPopupOpen: React.Dispatch<React.SetStateAction<boolean>>
   statistics: Entities.Statistics
}

export const Summary = ({ statistics, isSummaryPopupOpen, setIsSummaryPopupOpen } : ISummary) => {
 
   return (
      <Popup modal open={isSummaryPopupOpen} closeOnDocumentClick={false} closeOnEscape={true} contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {() => (        
            <div id='summary' className='modal'>
               <a className='close' onClick={() => setIsSummaryPopupOpen(false)}>&times;</a>
               <div className='content'>
                  <p className='header'>Solution</p>
                  <div className='summary-row'>
                  <StaticGridRow word={statistics.solution} statusMap={'X'.repeat(statistics.solution.length)}></StaticGridRow>      
                  </div>            
                  <p className='header'>Statistics</p>
                  <div className='statistics'>
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