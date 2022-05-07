import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCrypto } from '../contexts/useCrypto';
import { words } from '../data/words';
import { solutions } from '../data/solutions';
import { Grid } from '../components/Grid';
import { Keyboard } from '../components/Keyboard';
import { Introduction } from '../components/Introduction';
import { Title } from '../components/Title';
import { Summary } from '../components/Summary';
import { ModeChooser } from '../components/ModeChooser';
import { StatusBar } from '../components/StatusBar';
import { NoGasAvailable } from '../components/NoGasAvailable';

import * as Entities from '../models/entities';
import configSettings from '../config.json';

words.push(...solutions);

const wordLength = 5;
const maxGuesses = 6;
const letters = [
   ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
   ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
   ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Del']
];
const statusToSymbolMap = new Map([
   [Entities.TileStatus.Correct, 'X'],
   [Entities.TileStatus.IncorrectPosition, 'O'],
   [Entities.TileStatus.Incorrect, '-']
]);

const wordDictionary = Object.assign({}, ...words.map((x) => ({ [x]: x })));

const startingKeyboard: Entities.KeyboardLetter[][] = letters.map((row) => {
   return row.map((letter) => {
      return { value: letter, status: Entities.TileStatus.None };
   });
});

const startingGrid: Entities.GridTile[][] = Array.apply(null, Array(maxGuesses)).map((row) => {
   return Array.apply(null, Array(wordLength)).map((tile) => {
      return { value: '', status: Entities.TileStatus.None };
   });
})

const statisticsCookieName = 'statistics';
const introShownCookieName = 'intro-shown';
const startingTime = new Date().getTime();
let nullBoolean : boolean | null;

const Index = () => {
   const router = useRouter();

   const { blockchainStatus, validateBlockchain } = useCrypto();
   const { contract } = useCrypto();
   const { mintToken } = useCrypto();

   const [grid, setGrid] = useState(startingGrid);
   const [gameMode, setGameMode] = useState(Entities.GameMode.Unknown);
   const [keyboard, setKeyboard] = useState(startingKeyboard);
   const [currentRowIndex, setCurrentRowIndex] = useState(0);
   const [currentTileIndex, setCurrentTileIndex] = useState(0);
   const [solution, setSolution] = useState('');
   const [statistics, setStatistics] = useState({ gamesPlayed: 0, gamesWon: 0, streak: 0, guesses: [], solution: '' });
   const [gameStatus, setGameStatus] = useState(Entities.GameStatus.Started);
   const [guessResults, setGuessResults] = useState([]);
   const [isGameModePopupOpen, setIsGameModePopupOpen] = useState(nullBoolean);
   const [isIntroductionPopupOpen, setIsIntroductionPopupOpen] = useState(nullBoolean);
   const [isSummaryPopupOpen, setIsSummaryPopupOpen] = useState(nullBoolean);
   const [isNoGasAvailablePopupOpen, setIsNoGasAvailablePopupOpen] = useState(nullBoolean);

   useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      return () => { document.removeEventListener('keydown', handleKeyDown); }
   });

   useEffect(() => {
      (async () => {
         setTimeout(() => {
            document.querySelectorAll('.hidden-on-load').forEach(e => { e.classList.add('visible-after-load') });
         }, 1000);

         const status = await validateBlockchain();

         switch (status) { 
            case Entities.BlockchainStatus.NoGas:         
               setIsNoGasAvailablePopupOpen(true);
               break;
            case Entities.BlockchainStatus.NotConnected:
               setIsGameModePopupOpen(true);
               break;
         }
         // todo not sure why this is necessary, without it though the keyboard state is preserved, somehow
         setKeyboard(() => letters.map((row) => { return row.map((letter) => { return { value: letter, status: Entities.TileStatus.None }; }); }));
      })();
   }, []);
   
   useEffect(() => {
      (async () => {         
      })();
   }, [router]);

   useEffect(() => {
      (async () => {
         if (gameMode !== Entities.GameMode.Unknown) {
            setIsGameModePopupOpen(false);
         }
      })();
   }, [gameMode]);

   useEffect(() => {
      (async () => {
         if (isNoGasAvailablePopupOpen === false) {
            setGameMode(Entities.GameMode.Disconnected);
         }
      })();
   }, [isNoGasAvailablePopupOpen]);

   useEffect(() => {
      (async () => {         
         if (blockchainStatus === Entities.BlockchainStatus.Unknown) { return; }
         if (solution !== '') { return; }

         let uniqueSolution = await chooseSolution();
         setSolution(uniqueSolution);
        
         if (!Cookies.get(introShownCookieName)) {
            setTimeout(() => {
               Cookies.set(introShownCookieName, 'true', { expires: 7, sameSite: 'None', secure: true })
               setIsIntroductionPopupOpen(true);
            }, 100);
         }
      })();
   }, [blockchainStatus]);

   const handleKeyDown = (e) => {
      if (gameStatus === Entities.GameStatus.Won || gameStatus === Entities.GameStatus.Lost) {
         return;
      }

      if (e.keyCode >= 65 && e.keyCode <= 90) {
         if (currentTileIndex >= wordLength) { return; }
         enterLetter(String.fromCharCode(e.keyCode));
      }
      else if (e.keyCode === 8) {
         if (currentTileIndex === 0) { return; }
         deleteLetter();
      }
      else if (e.keyCode === 13) {
         if (currentTileIndex < wordLength) { return; }
         enterWord();
      }
   }

   const chooseSolution = async (): Promise<string> => {
      const maxAttempts = 100;

      for (let i = 0; i < maxAttempts; i++) {
         let solution = solutions[Math.floor(Math.random() * solutions.length)];
         
         if (blockchainStatus !== Entities.BlockchainStatus.Connected) {
            return solution;
         } else {
            const isWordUnique = await contract.methods.isSolutionUnique(solution).call();

            if (isWordUnique) {
               return solution;
            }
         }
      }

      window.alert(`Unable to determine a unique solution after ${maxAttempts} attempts`);
      return '';
   }

   const enterLetter = (letter) => {
      if (isGameModePopupOpen || isIntroductionPopupOpen || isNoGasAvailablePopupOpen) { return; }

      const newGrid = JSON.parse(JSON.stringify(grid));
      let thisTile = newGrid[currentRowIndex][currentTileIndex];

      thisTile.value = letter;
      thisTile.status = Entities.TileStatus.Entered;

      setGrid(newGrid);
      setCurrentTileIndex(currentTileIndex + 1);
   }

   const deleteLetter = () => {
      if (isGameModePopupOpen || isIntroductionPopupOpen || isNoGasAvailablePopupOpen) { return; }

      const newGrid = JSON.parse(JSON.stringify(grid));
      let thisTile = newGrid[currentRowIndex][currentTileIndex - 1];

      thisTile.value = '';

      for (const [i, tile] of newGrid[currentRowIndex].entries()) {
         if (i >= currentTileIndex - 1) {
            tile.status = Entities.TileStatus.None;
         }
         else {
            tile.status = Entities.TileStatus.EnteredNoAnimation;
         }
      }

      setGrid(newGrid);
      setCurrentTileIndex(currentTileIndex - 1);
   }

   const evaluateWord = (guess, row, keyboard): [boolean, string] => {
      if (!wordDictionary[guess]) {
         for (const tile of row) {
            tile.status = Entities.TileStatus.Error;
         }
         return [false, null];
      }
      else {
         for (const [i, tile] of row.entries()) {
            if (tile.value === solution.charAt(i)) {
               tile.status = Entities.TileStatus.Correct;
            }
         }

         for (const [i, tile] of row.entries()) {
            if (tile.status === Entities.TileStatus.Correct) { continue; }

            let matchesSoFar = row.filter(item => item.value === tile.value && (item.status === Entities.TileStatus.Correct || item.status === Entities.TileStatus.IncorrectPosition)).length;
            let matchesInSolution = solution.split('').filter(x => x === tile.value).length;

            tile.status = matchesInSolution > matchesSoFar ? Entities.TileStatus.IncorrectPosition : Entities.TileStatus.Incorrect;
         }

         for (const [i, tile] of row.entries()) {
            let keyboardLetter = getKeyboardLetter(keyboard, tile.value);

            keyboardLetter.status = tile.status;
            keyboardLetter.sequence = i;
         }

         const symbolMap = row.map((item) => { return statusToSymbolMap.get(item.status); }).join('');

         return [true, symbolMap];
      }
   }

   const enterWord = async () => {
      const newGrid = JSON.parse(JSON.stringify(grid));
      let newKeyboard = [...keyboard];
      let row = newGrid[currentRowIndex];
      let guess = row.map(letter => letter.value).join('');
      let [result, symbolMap] = evaluateWord(guess, row, newKeyboard);

      await setGrid(newGrid);

      if (result) {
         const newGuessResults = [...guessResults, symbolMap];
         const secondsRequired = Math.round((new Date().getTime() - startingTime) / 1000);

         setCurrentRowIndex(currentRowIndex + 1);
         setCurrentTileIndex(0);
         setKeyboard(newKeyboard);
         setGuessResults(newGuessResults);

         if (guess === solution) {
            await showSummary(Entities.GameStatus.Won);

            if (blockchainStatus === Entities.BlockchainStatus.Connected) {
               await mintToken(solution, newGuessResults, secondsRequired);
            }
         }
         else if (currentRowIndex >= maxGuesses - 1) {
            await showSummary(Entities.GameStatus.Lost);
         }
      }
   }

   const showSummary = async (newGameStatus: Entities.GameStatus) => {
      let newStatistics: Entities.Statistics;
      try { newStatistics = JSON.parse(Cookies.get(statisticsCookieName)); }
      catch { }

      if (!newStatistics) {
         newStatistics = { gamesPlayed: 0, gamesWon: 0, streak: 0, guesses: new Array(maxGuesses).fill(0), averageGuesses: 0.0, solution: '' };
      }

      newStatistics.gamesPlayed++;
      newStatistics.solution = solution;

      if (newGameStatus === Entities.GameStatus.Won) {
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

      Cookies.set(statisticsCookieName, JSON.stringify(newStatistics), { expires: 365, sameSite: 'None', secure: true });
      setStatistics(newStatistics);
      setGameStatus(newGameStatus);

      setTimeout(() => {
         setIsSummaryPopupOpen(true);
      }, 1500);

      setTimeout(() => {
         document.getElementById('summary').classList.add('flippable');
         document.getElementById('distribution').classList.remove('closed');
      }, 1800);
   }

   const getKeyboardLetter = (keyboard, letter): Entities.KeyboardLetter => {
      let keyboardLetter;

      for (const row of keyboard) {
         keyboardLetter = row.filter(x => x.value === letter);

         if (keyboardLetter.length === 1) {
            return keyboardLetter[0];
         }
      }
   }

   return (
      <>
         <Head>
            <title>{configSettings.appName}</title>
         </Head>
         <StatusBar></StatusBar>
         <div className='main'>
            <Title title={configSettings.appName}></Title>
            <Grid grid={grid}></Grid>
            <Keyboard keyboard={keyboard} handleKeyDown={(e) => handleKeyDown(e)}></Keyboard>
         </div>
         <Introduction isIntroductionPopupOpen={isIntroductionPopupOpen} setIsIntroductionPopupOpen={setIsIntroductionPopupOpen}></Introduction>
         <Summary statistics={statistics} isSummaryPopupOpen={isSummaryPopupOpen} setIsSummaryPopupOpen={setIsSummaryPopupOpen}></Summary>
         <ModeChooser setGameMode={setGameMode} isGameModePopupOpen={isGameModePopupOpen} setIsGameModePopupOpen={setIsGameModePopupOpen}></ModeChooser>
         <NoGasAvailable isNoGasAvailablePopupOpen={isNoGasAvailablePopupOpen} setIsNoGasAvailablePopupOpen={setIsNoGasAvailablePopupOpen}></NoGasAvailable>
      </>
   )
}

export default Index;
