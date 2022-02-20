import { useEffect } from "react";
import Popup from "reactjs-popup";

export const Summary = ({ statistics }) => {
  
   return (
      <Popup modal trigger={<button id='show-summary' type='button' className='button'>Show Statistics</button>} closeOnDocumentClick contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {close => (
            <div id='summary' className='modal'>
               <a className='close' onClick={close}>&times;</a>
               <div className='content'>
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
                        <p>{Math.round(10.0 * statistics.guesses / statistics.gamesWon) / 10}</p>
                        <label>Ave guesses</label>
                     </div>                 
                  </div>
                  <p className='header'>Guess distribution</p>
                  <div>1</div>
                  <div>2</div>
                  <div>3</div>
                  <div>4</div>
                  <div>5</div>
                  <div>6</div>               
               </div>
            </div>
         )}
      </Popup>
   )
}
