import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { words } from '../data/words';
import { solutions } from '../data/solutions';
import { Grid } from '../components/Grid';
import { Keyboard } from '../components/Keyboard';
import { Introduction } from '../components/Introduction';
import { Title } from '../components/Title';
import { Summary } from '../components/Summary';
import { ModeChooser } from '../components/ModeChooser';
import { TokenList } from '../components/TokenList';
import { StatusBar } from '../components/StatusBar';

import Head from 'next/head';
import Web3 from 'web3';
import GameContract from '../abis/EthordleGame.json';
import TokenContract from '../abis/EthordleToken.json';
import * as Entities from '../model/entities';

declare let window: any;

words.push(...solutions);

const appName = 'Ethordle';
const wordLength = 5;
const maxGuesses = 6;
const letters = [
   ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
   ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
   ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Del']
];

const wordDictionary = Object.assign({}, ...words.map((x) => ({ [x]: x })));

const startingKeyboard: Entities.KeyboardLetter[][] = letters.map((row, i) => {
   return row.map((letter, j) => {
      return { value: letter, status: Entities.TileStatus.None, rowIndex: i, keyIndex: j };
   });
});

const startingGrid: Entities.GridTile[][] = Array.apply(null, Array(maxGuesses)).map((row, i) => {
   return Array.apply(null, Array(wordLength)).map((tile, j) => {
      return { value: '', status: Entities.TileStatus.None, rowIndex: i, tileIndex: j };
   });
})

const statisticsCookieName = 'statistics';

const App = () => {
   const [grid, setGrid] = useState(startingGrid);
   const [keyboard, setKeyboard] = useState(startingKeyboard);
   const [currentRowIndex, setCurrentRowIndex] = useState(0);
   const [currentTileIndex, setCurrentTileIndex] = useState(0);
   const [solution, setSolution] = useState('');
   const [statistics, setStatistics] = useState({ gamesPlayed: 0, gamesWon: 0, streak: 0, guesses: [], solution: '' });
   const [account, setAccount] = useState('');
   const [tokens, setTokens] = useState(null);
   const [gameContract, setGameContract] = useState(null);
   const [tokenContract, setTokenContract] = useState(null);
   const [gameStatus, setGameStatus] = useState(Entities.GameStatus.Started);
   const [gameMode, setGameMode] = useState(Entities.GameMode.Unknown);
   const [isGameModePopupOpen, setIsGameModePopupOpen] = useState(false);
  
   useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      return () => { document.removeEventListener('keydown', handleKeyDown); }
   });

   useEffect(() => {
      (async () => {
         if (gameMode == Entities.GameMode.Unknown) { return; }

         let uniqueSolution = await chooseSolution();
         setSolution(uniqueSolution);

         if (gameMode != Entities.GameMode.Blockchain) { return; }         
         await updateTokenList();
      })();
   }, [gameMode]);

   useEffect(() => {
      (async () => {
         setTimeout(() => {
            document.querySelectorAll('.hidden-on-load').forEach(e => { e.classList.add('visible-after-load')});            
         }, 1000);

         const isEthereumEnabled = await loadWeb3();
               
         if (isEthereumEnabled) {
            await loadBlockchainData();         
         } else {
            setIsGameModePopupOpen(true);
         }
      })();
   }, [])
 
   const loadWeb3 = async () => {
      if (window.ethereum) {
         window.web3 = new Web3(window.ethereum);

         try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return true;
         }
         catch (error) {
            console.log(error);
            return false;
         }    
      }
      else if (window.web3) {
         window.web3 = new Web3(window.ethereum);
         return true;
      }
      else {
         return false;
      }
   }

   const loadBlockchainData = async () => {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const gameNetworkData = GameContract.networks[networkId];
      const tokenNetworkData = TokenContract.networks[networkId];

      if (gameNetworkData && tokenNetworkData) {
         const gameAddress = gameNetworkData.address;         
         const gameAbi = GameContract.abi;
         const gameContract = new web3.eth.Contract(gameAbi, gameAddress);
         setGameContract(gameContract);     
   
         const tokenAddress = tokenNetworkData.address;
         const tokenAbi = TokenContract.abi;
         const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
         setTokenContract(tokenContract);     
      
         console.log('Account: ' + accounts[0]);
         console.log('GameAddress: ' + gameAddress);
         console.log('GameContract: ' + gameContract);
         console.log('TokenAddress: ' + tokenAddress);
         console.log('TokenContract: ' + tokenContract);
      
         setGameMode(Entities.GameMode.Blockchain);      
      } else {         
         window.alert('Smart contract not deployed to a detected network.')
      }
   }

   const updateTokenList = async () => {
      const tokenCount = await tokenContract.methods.getMintedTokenCount().call();      
      
      var existingTokens: string[] = [];         

      for (let i = 0; i < tokenCount; i++) {
         const tokenURI = await tokenContract.methods.tokenURI(i).call();           
         existingTokens.push(tokenURI);            
      }
     
      setTokens(existingTokens);
   }

   const handleKeyDown = (e) => {
      if (gameStatus == Entities.GameStatus.Won || gameStatus == Entities.GameStatus.Lost) {
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

   const chooseSolution = async () : Promise<string> => {      
      const maxAttempts = 100;

      for (let i = 0; i < maxAttempts; i++) {
         let solution = solutions[Math.floor(Math.random() * solutions.length)];
         console.log(`${i}: ${solution}`);
            
         if (gameMode == Entities.GameMode.Disconnected ) {                   
            return solution;
         } else {
            const isWordUnique = await gameContract.methods.isWordUnique(solution).call();           
            
            if (isWordUnique) {              
               return solution;
            }
         }
      }

      window.alert(`Unable to determine a unique solution after ${maxAttempts} attempts`);         
      return '';
   }

   const enterLetter = (letter) => {
      const newGrid = JSON.parse(JSON.stringify(grid));
      let thisTile = newGrid[currentRowIndex][currentTileIndex];

      thisTile.value = letter;
      thisTile.status = Entities.TileStatus.Entered;

      setGrid(newGrid);
      setCurrentTileIndex(currentTileIndex + 1);
   }

   const deleteLetter = () => {
      const newGrid = JSON.parse(JSON.stringify(grid));
      let thisTile = newGrid[currentRowIndex][currentTileIndex - 1];

      thisTile.value = '';

      for (const [i, tile] of newGrid[currentRowIndex].entries()) {

         if (i >= currentTileIndex - 1) {
            tile.status = Entities.TileStatus.None;
         }
         else {
            tile.status =  Entities.TileStatus.EnteredNoAnimation;
         }
      }

      setGrid(newGrid);
      setCurrentTileIndex(currentTileIndex - 1);
   }

   const evaluateWord = (guess, row, keyboard) : boolean => {
      if (!wordDictionary[guess]) {
         for (const tile of row) {
            tile.status = Entities.TileStatus.Error;
         }
         return false;
      }
      else {
         for (const [i, tile] of row.entries()) {
            if (tile.value == solution.charAt(i)) {
               tile.status = Entities.TileStatus.Correct;
            }
         }

         for (const [i, tile] of row.entries()) {
            if (tile.status == Entities.TileStatus.Correct) { continue; }

            let matchesSoFar = row.filter(item => item.value == tile.value && (item.status == Entities.TileStatus.Correct || item.status == Entities.TileStatus.IncorrectPosition)).length;
            let matchesInSolution = solution.split('').filter(x => x == tile.value).length;

            tile.status = matchesInSolution > matchesSoFar ? Entities.TileStatus.IncorrectPosition : Entities.TileStatus.Incorrect;
         }

         for (const [i, tile] of row.entries()) {
            let keyboardLetter = getKeyboardLetter(keyboard, tile.value);

            keyboardLetter.status = tile.status;
            keyboardLetter.sequence = i;
         }

         return true;
      }
   }

   const enterWord = async () => {
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
            setGameStatus(Entities.GameStatus.Won);
            showSummary();

            if (gameMode == Entities.GameMode.Blockchain) {
               console.log('minting ' + solution + ' to ' + account);
               await tokenContract.methods.mint(account, solution, `solutions/${solution}.png` ).send({ from: account });
               await updateTokenList();
            }
         }
         else if (currentRowIndex >= maxGuesses - 1) {
            setGameStatus(Entities.GameStatus.Lost);
            showSummary();
         }
      }

      setGrid(newGrid);
   }

   const showSummary = async () => {
      let newStatistics: Entities.Statistics;

      try { newStatistics = JSON.parse(Cookies.get(statisticsCookieName)); }
      catch { }

      if (!newStatistics) {
         newStatistics = { gamesPlayed: 0, gamesWon: 0, streak: 0, guesses: new Array(maxGuesses).fill(0), averageGuesses: 0.0, solution: '' };
      }

      newStatistics.gamesPlayed++;
      newStatistics.solution = solution;

      if (gameStatus == Entities.GameStatus.Won) {
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

      Cookies.set(statisticsCookieName, JSON.stringify(newStatistics), { expires: 365 });
      setStatistics(newStatistics);

      setTimeout(() => {
         document.getElementById('show-summary').click();
      }, 1500);

      setTimeout(() => {
         document.getElementById('summary').classList.add('flippable');
         document.getElementById('distribution').classList.remove('closed');
      }, 1800);
   }

   const getKeyboardLetter = (keyboard, letter) : Entities.KeyboardLetter => {
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
      {account === '' ? null : <StatusBar account={account} tokens={tokens}></StatusBar>}
      <div className='main'>
         <Title title={appName}></Title>
         <Grid grid={grid}></Grid>
         <Keyboard keyboard={keyboard} handleKeyDown={(e) => handleKeyDown(e)}></Keyboard>
         <Introduction></Introduction>
         <Summary statistics={statistics}></Summary>
         <ModeChooser setGameMode={setGameMode} isGameModePopupOpen={isGameModePopupOpen} setIsGameModePopupOpen={setIsGameModePopupOpen}></ModeChooser>     
      </div>
      </>
   )
}

export default App;
