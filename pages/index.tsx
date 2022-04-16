import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Head from 'next/head';
import Web3 from 'web3';
import { useCrypto } from '../context/useCrypto';
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

import * as Entities from '../model/entities';
import configData from '../config.json';

words.push(...solutions);

const appName = 'Ethordle';
const tokenPrice = '1'; //'0.005';
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
const startingTime = new Date().getTime();

const App = () => {
   const { blockchain, connectToBlockchain  } = useCrypto();  // blockchain var is a dummy
   const { account,  } = useCrypto();
   const { tokens, setTokens } = useCrypto();
   const { contract,  } = useCrypto();
   
   const [grid, setGrid] = useState(startingGrid);
   const [keyboard, setKeyboard] = useState(startingKeyboard);
   const [currentRowIndex, setCurrentRowIndex] = useState(0);
   const [currentTileIndex, setCurrentTileIndex] = useState(0);
   const [solution, setSolution] = useState('');
   const [statistics, setStatistics] = useState({ gamesPlayed: 0, gamesWon: 0, streak: 0, guesses: [], solution: '' }); 
   const [gameStatus, setGameStatus] = useState(Entities.GameStatus.Started);
   const [gameMode, setGameMode] = useState(Entities.GameMode.Unknown);
   const [isGameModePopupOpen, setIsGameModePopupOpen] = useState(false);
   const [guessResults, setGuessResults] = useState([]);

   useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      return () => { document.removeEventListener('keydown', handleKeyDown); }
   });

   useEffect(() => {
      (async () => {
         if (gameMode == Entities.GameMode.Unknown) { return; }

         let uniqueSolution = await chooseSolution();
         setSolution(uniqueSolution);

         if (gameMode != Entities.GameMode.Blockchain) { return; }2
         await updateTokenList();
      })();
   }, [gameMode]);

   useEffect(() => {
      (async () => {
         setTimeout(() => {
            document.querySelectorAll('.hidden-on-load').forEach(e => { e.classList.add('visible-after-load') });
         }, 1000);

         let connected = await connectToBlockchain;  // todo
         console.log(connected);
      })();
   }, [])

   const pinJsonToIpfs = async (json: object) : Promise<string> => {
      var ipfsUrl = '';
      const apiUrl = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

      await axios.post(apiUrl, json, {
         headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': configData.pinataApiKey,
            'pinata_secret_api_key': configData.pinataSecretApiKey
         }
      }
      ).then((response) => {
         ipfsUrl = `https://ipfs.infura.io/ipfs/${response.data.IpfsHash}`;
      }).catch((ex) => {
         console.log(ex);
         throw ex;
      });

      return ipfsUrl;
   };

   const pinFileToIpfs = async (fileUrl: string) : Promise<string> => {
      var ipfsUrl = '';
      const apiUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

      const data = await downloadFile(fileUrl);
      
      let formData = new FormData();
      formData.append('file', new Blob([data]));

      await axios.post(apiUrl, formData, {
         headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': configData.pinataApiKey,
            'pinata_secret_api_key': configData.pinataSecretApiKey
         }
      }
      ).then(response => {
         ipfsUrl = `https://ipfs.infura.io/ipfs/${response.data.IpfsHash}`;
      }).catch(ex => {
         console.log(ex);
         throw ex;
      });

      return ipfsUrl;
   };

   const updateTokenList = async () => {
      const tokenIdsOfOwner = await contract.methods.tokensOfOwner(account).call();      
      const existingTokens: Entities.TokenMetadata[] = [];
      
      for (let i = 0; i < tokenIdsOfOwner.length; i++) {
         try { 
            const tokenURI = await contract.methods.tokenURI(i).call();                    
            const metadataFile = await downloadFile(tokenURI, 2000);
            const metadataString = String.fromCharCode.apply(null, new Uint8Array(metadataFile));
            const metadata = JSON.parse(metadataString);
            metadata.url = tokenURI;

            console.log('TokenURI: ' + tokenURI);
            console.log('TokenImage: ' + metadata.imageUrl); 
            
            existingTokens.push(metadata);            
         } catch (ex) {
            console.log(ex);
         }
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

   const chooseSolution = async (): Promise<string> => {
      const maxAttempts = 100;

      for (let i = 0; i < maxAttempts; i++) {
         let solution = solutions[Math.floor(Math.random() * solutions.length)];
         console.log(`${i}: ${solution}`);

         if (gameMode == Entities.GameMode.Disconnected) {
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

         if (guess == solution) {
            await showSummary(Entities.GameStatus.Won);
           
            if (gameMode == Entities.GameMode.Blockchain) {
               await mintToken(solution, newGuessResults, secondsRequired);
            }
         }
         else if (currentRowIndex >= maxGuesses - 1) {
            await showSummary(Entities.GameStatus.Lost);
         }
      }
   }

   const mintToken = async (tokenSolution: string, tokenGuessResults: string[], secondsRequired: number) => {
      const imageUrl = await pinFileToIpfs(`/solutions/${solution}.png`);
      console.log('Token image URL: ' + imageUrl);

      const metadata: Entities.TokenMetadata = {
         solution: tokenSolution,
         imageUrl: imageUrl,
         secondsRequired: secondsRequired,
         guesses: tokenGuessResults
      };

      const metadataUrl = await pinJsonToIpfs(metadata);
      console.log('Token metadata URL: ' + metadataUrl);
      metadata.url = metadataUrl;

      await contract.methods.mint(account, solution, metadataUrl).send({ from: account, value: Web3.utils.toWei(tokenPrice, 'ether') });   
   }

   const downloadFile = async (url: string, timeout: number = null) : Promise<ArrayBuffer> => {
      let data : ArrayBuffer;
    
      await axios.get(url, {
         timeout: timeout,
         responseType: 'arraybuffer'
      }).then(response => {
         data = response.data;
      }).catch(ex => {
         console.log(ex);
         throw ex;
      });
   
      return data;
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

      if (newGameStatus == Entities.GameStatus.Won) {
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
      setGameStatus(newGameStatus);
      
      setTimeout(() => {
         document.getElementById('show-summary').click();
      }, 1500);

      setTimeout(() => {
         document.getElementById('summary').classList.add('flippable');
         document.getElementById('distribution').classList.remove('closed');
      }, 1800);
   }

   const getKeyboardLetter = (keyboard, letter): Entities.KeyboardLetter => {
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
            {account === '' || !tokens ? null : <TokenList tokens={tokens}></TokenList>}

         </div>
         <Introduction></Introduction>
         <Summary statistics={statistics}></Summary>
         <ModeChooser setGameMode={setGameMode} isGameModePopupOpen={isGameModePopupOpen} setIsGameModePopupOpen={setIsGameModePopupOpen}></ModeChooser>
      </>
   )
}

export default App;
