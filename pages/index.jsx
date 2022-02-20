import React, { useState } from 'react';
import { words } from '../data/words';
import { solutions } from '../data/solutions';
import { Grid } from '../components/Grid';
import { Keyboard } from '../components/Keyboard';
import { Introduction } from '../components/Introduction';
import { Title } from '../components/Title';

words.push(...solutions);

const appName = 'ETHORDLE';
const solution = solutions[Math.floor(Math.random() * solutions.length)];
const wordLength = 5;
const maxGuesses = 6;
const letters = [
   ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
   ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
   ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Del']
];

const wordDictionary = Object.assign({}, ...words.map((x) => ({ [x]: x })));
const startingKeyboard = letters.map(row => {
   return row.map(letter => {
      return { value: letter, status: '' };
   });
});

const startingGrid = Array.apply(null, Array(maxGuesses)).map((row, i) => {
   return Array.apply(null, Array(wordLength)).map((tile, j) => {
      return { value: '', status: '', rowIndex: i, tileIndex: j };
   });
})

const App = () => {
   const [grid, setGrid] = useState(startingGrid);
   const [keyboard, setKeyboard] = useState(startingKeyboard);
   const [currentRowIndex, setCurrentRowIndex] = useState(0);
   const [currentTileIndex, setCurrentTileIndex] = useState(0);
   const [gameStatus, setGameStatus] = useState('started');

   React.useEffect(() => {
      document.addEventListener('keydown', handleKeyDown)

      return () => {
         document.removeEventListener('keydown', handleKeyDown)
      }
   })

   const handleKeyDown = (e) => {
      if (gameStatus == 'finished') {
         return;
      }

      if (e.keyCode >= 65 && e.keyCode <= 90) {
         if (currentTileIndex >= wordLength) { return; }
         enterLetter(String.fromCharCode(e.keyCode));
      }
      else if (e.keyCode == 8) {
         if (currentTileIndex == 0) { return; }
         deleteLetter();
      }
      else if (e.keyCode == 13) {
         if (currentTileIndex < wordLength) { return; }
         enterWord();
      }
   }

   const enterLetter = (letter) => {
      let newGrid = [...grid];
      let thisTile = newGrid[currentRowIndex][currentTileIndex];

      thisTile.value = letter;
      thisTile.status = 'entered';

      setGrid(newGrid);
      setCurrentTileIndex(currentTileIndex + 1);
   }

   const deleteLetter = () => {
      let newGrid = [...grid];
      let thisTile = newGrid[currentRowIndex][currentTileIndex - 1];

      thisTile.value = '';
      thisTile.status = '';

      setGrid(newGrid);
      setCurrentTileIndex(currentTileIndex - 1);
   }

   const enterWord = () => {
      let newGrid = [...grid];
      let newKeyboard = [...keyboard];
      let row = newGrid[currentRowIndex];
      let guess = row.map(letter => letter.value).join('');
      let result = evaluateWord(guess, row, newKeyboard);

      if (result) {
         setCurrentRowIndex(currentRowIndex + 1);
         setCurrentTileIndex(0);
         setKeyboard(newKeyboard);
      }

      setGrid(newGrid);
         
      if (currentRowIndex >= maxGuesses - 1 || guess == solution) {
         setGameStatus('finished');
      }
   }

   const evaluateWord = (guess, row, keyboard) => {
      if (!wordDictionary[guess]) {
         for (const letter of row) {
            letter.status = 'error';
         }
         return false;
      }
      else {
         for (const [i, letter] of row.entries()) {
            if (letter.value == solution.charAt(i)) {
               letter.status = 'correct';
            }
         }

         for (const [i, letter] of row.entries()) {
            if (letter.status == 'correct') { continue; }

            let matchesSoFar = row.filter(item => item.value == letter.value && (item.status == 'correct' || item.status == 'incorrect-position')).length;
            let matchesInSolution = solution.split('').filter(x => x == letter.value).length;

            letter.status = matchesInSolution > matchesSoFar ? 'incorrect-position' : 'incorrect';
         }

         for (const [i, letter] of row.entries()) {
            let keyboardLetter = getKeyboardLetter(keyboard, letter.value);

            keyboardLetter.status = letter.status;
            keyboardLetter.sequence = `sequence${i}`;
         }

         return true;
      }
   }

   const getKeyboardLetter = (keyboard, letter) => {
      var keyboardLetter;

      for (const row of keyboard) {
         keyboardLetter = row.filter(x => x.value == letter);

         if (keyboardLetter.length == 1) {
            return keyboardLetter[0];
         }
      }
   }

   return (
      <div className='main'>
         <Title title={appName}></Title>
         <Grid grid={grid}></Grid>
         <Keyboard keyboard={keyboard} handleKeyDown={(e) => handleKeyDown(e)}></Keyboard>
         <Introduction></Introduction>
      </div>
   )
}

export default App;