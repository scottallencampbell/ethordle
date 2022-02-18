import { useEffect } from 'react';
import Popup from 'reactjs-popup';
import { GridTile } from './GridTile';
import Cookies from 'js-cookie';

const introShownCookieName = 'intro-shown';
const statusCodes = new Map([
   ['X', 'correct'],
   ['O', 'incorrect-position'],
   ['-', 'incorrect'],
   [' ', 'entered']
]);


export const Introduction = () => {
   useEffect(() => {
      if (!Cookies.get(introShownCookieName)) {
         setTimeout(() => {
            Cookies.set(introShownCookieName, 'true', { expires: 7 })
            document.getElementById('show-intro').click();
         }, 100);

         setTimeout(() => {
            document.getElementById('intro').classList.add('flippable');
         }, 500);
      }
   }, [])

   return (
      <Popup modal trigger={<button id='show-intro' type='button' className='button'>  </button>} closeOnDocumentClick contentStyle={{ maxWidth: '600px', width: '90%' }} >
         {close => (
            <div id='intro' className='modal'>
               <a className='close' onClick={close}>&times;</a>
               <div className={`content`}></div>
               <div className='content'>
                  <p>Welcome to <b>ETHORDLE</b>, an NFT-enabled version of the popular Wordle game.</p>
                  <p>Each guess must be a vaid five-letter word.  Hit the Enter button to submit your guess.</p>
                  <p>If you guess the correct word, you will be entered into a daily lottery.  One winner will be selected every day.  The prize is an NFT corresponding to the correct solution, as well as an ether distribution from the pot for that day.</p>
                  <p>After each guess, the color of the tiles will change to show how close your guess was to the solution.</p>
                  <hr></hr>
                  <p><b>Examples</b></p>
                  <GridRowExample word={'CHOMP'} statusMap={'X    '} i={0}></GridRowExample>
                  <p>The letter <b>C</b> is in the solution and is in the correct spot.</p>
                  <GridRowExample word={'BLURT'} statusMap={' O   '} i={1}></GridRowExample>
                  <p>The letter <b>L</b> is in the solution but is in the wrong location.</p>
                  <GridRowExample word={'SPORK'} statusMap={'  -  '} i={2}></GridRowExample>
                  <p>The letter <b>O</b> is not in the solution at any location.</p>
                  <hr></hr>
                  <p><b>The solution for a given day is unique to every ethereum account.  There's no use in sharing your answer with another user!</b></p>
               </div>
            </div>
         )}
      </Popup>
   )
}

export const GridRowExample = ({ word, statusMap, i }) => {

   return (
      <div className='row example'> {
         word.split('').map((letter, j) => {
            return (
               <GridTile key={`${i}-${j}`} tile={{ value: letter, tileIndex: j, status: statusCodes.get(statusMap[j]) }}></GridTile>
            )
         })
      }
      </div>
   )
}
