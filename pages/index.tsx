import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { words } from '../data/words';
import { solutions } from '../data/solutions';
import { Grid } from '../components/Grid';
import { Keyboard } from '../components/Keyboard';
import { Introduction } from '../components/Introduction';
import { Title } from '../components/Title/Index';
import { Summary } from '../components/Summary';
import Head from 'next/head';

export interface IGridTileInfo {
   value: string,
   status: string,
   rowIndex: number,
   tileIndex: number
}

export interface IKeyboardInfo {
   value: string,
   status: string,
   rowIndex: number,
   keyIndex: number,
   sequence?: number
}

export interface IStatistics {
   gamesPlayed: number,
   gamesWon: number,
   streak: number,
   guesses: number[],
   solution: string,
   averageGuesses?: number
};

words.push(...solutions);

const appName = 'Ethordle';
const solution = solutions[Math.floor(Math.random() * solutions.length)];
const wordLength = 5;
const maxGuesses = 6;
const letters = [
   ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
   ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
   ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Del']
];

const wordDictionary = Object.assign({}, ...words.map((x) => ({ [x]: x })));

const startingKeyboard:IKeyboardInfo[][] = letters.map((row, i) => {
   return row.map((letter, j) => {
      return { value: letter, status: '', rowIndex: i, keyIndex: j};
   });
});

const startingGrid:IGridTileInfo[][] = Array.apply(null, Array(maxGuesses)).map((row, i) => {
   return Array.apply(null, Array(wordLength)).map((tile, j) => {
      return { value: '', status: '', rowIndex: i, tileIndex: j };
   });
})

const statisticsCookieName = 'statistics';
var gameStatus = 'started';

const App = () => {
   const [grid, setGrid] = useState(startingGrid);
   const [keyboard, setKeyboard] = useState(startingKeyboard);
   const [currentRowIndex, setCurrentRowIndex] = useState(0);
   const [currentTileIndex, setCurrentTileIndex] = useState(0);
   const [statistics, setStatistics] = useState({ gamesPlayed: 0, gamesWon: 0, streak: 0, guesses: [], solution: '' });
   
   useEffect(() => {
      document.addEventListener('keydown', handleKeyDown)

      return () => {
         document.removeEventListener('keydown', handleKeyDown)
      }
   });

   const handleKeyDown = (e) => {
      if (gameStatus == 'won' || gameStatus == 'lost') {
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
      const newGrid = JSON.parse(JSON.stringify(grid));
      let thisTile = newGrid[currentRowIndex][currentTileIndex];

      thisTile.value = letter;
      thisTile.status = 'entered';

      setGrid(newGrid);
      setCurrentTileIndex(currentTileIndex + 1);
   }

   const deleteLetter = () => {
      const newGrid = JSON.parse(JSON.stringify(grid));
      let thisTile = newGrid[currentRowIndex][currentTileIndex - 1];
      
      thisTile.value = '';

      for (const [i, tile] of newGrid[currentRowIndex].entries()) {
         
         if (i >= currentTileIndex - 1) {
            tile.status = '';
         }
         else {
            tile.status = 'entered-no-animation';
         }
      }

      setGrid(newGrid);
      setCurrentTileIndex(currentTileIndex - 1);
   }

   const evaluateWord = (guess, row, keyboard) => {
      if (!wordDictionary[guess]) {
         for (const tile of row) {
            tile.status = 'error';
         }
         return false;
      }
      else {
         for (const [i, tile] of row.entries()) {
            if (tile.value == solution.charAt(i)) {
               tile.status = 'correct';
            }
         }

         for (const [i, tile] of row.entries()) {
            if (tile.status == 'correct') { continue; }

            let matchesSoFar = row.filter(item => item.value == tile.value && (item.status == 'correct' || item.status == 'incorrect-position')).length;
            let matchesInSolution = solution.split('').filter(x => x == tile.value).length;

            tile.status = matchesInSolution > matchesSoFar ? 'incorrect-position' : 'incorrect';
         }

         for (const [i, tile] of row.entries()) {
            let keyboardLetter = getKeyboardLetter(keyboard, tile.value);

            keyboardLetter.status = tile.status;
            keyboardLetter.sequence = `sequence${i}`;
         }

         return true;
      }
   }
   
   const enterWord = () => {
      const newGrid = JSON.parse(JSON.stringify(grid));
      let newKeyboard = [...keyboard];
      let row = newGrid[currentRowIndex];
      let guess = row.map(letter => letter.value).join('');
      let result = evaluateWord(guess, row, newKeyboard);

      if (result) {
         setCurrentRowIndex(currentRowIndex + 1);
         setCurrentTileIndex(0);
         setKeyboard(newKeyboard);
        
         if (guess == solution) {
            gameStatus = 'won';
            showSummary();
         }
         else if (currentRowIndex >= maxGuesses - 1) {
            gameStatus = 'lost';
            showSummary();
         }
      }

      setGrid(newGrid);
   }

   const showSummary = () => { 
      let newStatistics:IStatistics;

      try { newStatistics = JSON.parse(Cookies.get(statisticsCookieName)); }
      catch {}
   
      if (!newStatistics) {
         newStatistics = { gamesPlayed: 0, gamesWon: 0, streak: 0, guesses: new Array(maxGuesses).fill(0), averageGuesses: 0.0, solution: '' };
      }
      
      newStatistics.gamesPlayed++; 
      newStatistics.solution = solution;

      if (gameStatus == 'won') {         
         newStatistics.gamesWon++;
         newStatistics.streak++;
         newStatistics.guesses[currentRowIndex]++;
         newStatistics.averageGuesses = 0;

         let guesses = 0;

         for (let i = 0; i < newStatistics.guesses.length; i++) {
            guesses += (i + 1) * newStatistics.guesses[i];
         }
         
         newStatistics.averageGuesses = Math.round(10.0 * guesses / newStatistics.gamesWon) / 10.0;       
      }
      else {
         newStatistics.streak = 0;
      }
      
      Cookies.set(statisticsCookieName, JSON.stringify(newStatistics),  { expires: 365 });        
      setStatistics(newStatistics);

      setTimeout(() => { 
         document.getElementById('show-summary').click();         
      }, 1500);

      setTimeout(() => { 
         document.getElementById('summary').classList.add('flippable');
         document.getElementById('distribution').classList.remove('closed');
      }, 1800);
   }

   const getKeyboardLetter = (keyboard, letter) => {
      let keyboardLetter;

      for (const row of keyboard) {
         keyboardLetter = row.filter(x => x.value == letter);

         if (keyboardLetter.length == 1) {
            return keyboardLetter[0];
         }
      }
   }

   return (
      <>
      <Head>
        <title>{appName}</title>
        <link rel='icon' href='/favicon.ico'></link> 
      </Head>
      <div className='main'>
         <Title title={appName}></Title>
         <Grid grid={grid}></Grid>
         <Keyboard keyboard={keyboard} handleKeyDown={(e) => handleKeyDown(e)}></Keyboard>
         <Introduction></Introduction>
         <Summary statistics={statistics}></Summary>
      </div>
      </>
   )
}

export default App;