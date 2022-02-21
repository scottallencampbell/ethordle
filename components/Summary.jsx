import { useEffect } from 'react';
import Popup from 'reactjs-popup';
import { StaticGridRow } from './GridRow';

export const Summary = ({ solution, statistics, pop, openSummary }) => {
 
   return (
      <Popup modal trigger={<button id='show-summary' type='button' className='button'>Show Statistics</button>} closeOnDocumentClick contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {close => (
            <div id='summary' className='modal flippable'>
               <a className='close' onClick={close}>&times;</a>
               <div className='content'>
                  <p className='header'>Solution</p>
                  <div class='row summary-row'>
                  <StaticGridRow word={statistics.solution} statusMap={new Array(statistics.solution.length).fill('X')} i={0}></StaticGridRow>      
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
                              <div className='chart'>
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