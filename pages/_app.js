import React, { useEffect, useState } from "react";
import Popup from 'reactjs-popup';
import Cookies from 'js-cookie';
import {words} from '../data/words';
import {solutions} from '../data/solutions';
import '../styles/global.css'

words.push(...solutions);

const appName = 'ETHORDLE';
const solution = solutions[Math.floor(Math.random() * solutions.length)];
const wordLength = 5;
const maxGuesses = 6;
const letters = [ 
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'], 
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'], 
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Del' ]
  ];
const statusCodes = new Map([ 
    [ 'X', "correct" ],
    [ 'O', "incorrect-position" ],
    [ '-', "incorrect" ],
    [ '', "" ]
]);
const introShownCookieName = 'intro-shown3';

var wordDictionary = Object.assign({}, ...words.map((x) => ({[x]: x})));

var startingKeyboard = letters.map(row => {
    return row.map(letter => {
      return { value: letter, status: "" };
    });
});

var startingGrid = Array.apply(null, Array(maxGuesses)).map(function () { 
  return Array.apply(null, Array(wordLength)).map(function () { 
    return { value: "", status: "" }; }); })

const App = () => {
  const [grid, setGrid] = useState(startingGrid);
  const [keyboard, setKeyboard] = useState(startingKeyboard);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentTileIndex, setCurrentTileIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState("started");
  
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
   
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  })

  var handleKeyDown = (e) => {
    if (gameStatus == "finished") {
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

  var enterLetter = (letter) => {
    var newGrid = JSON.parse(JSON.stringify(grid)); // hmmmm
    var thisTile = newGrid[currentRowIndex][currentTileIndex];
    
    thisTile.value = letter;
    thisTile.status = "entered";    
  
    setGrid(newGrid);
    setCurrentTileIndex(currentTileIndex + 1);
  }

  var deleteLetter = () => {
    var newGrid = JSON.parse(JSON.stringify(grid)); // hmmmm
    var thisTile = newGrid[currentRowIndex][currentTileIndex - 1];
    
    thisTile.value = "";
    thisTile.status = "";

    setGrid(newGrid);
    setCurrentTileIndex(currentTileIndex - 1);
  }

  var enterWord = () => {
    var newGrid = JSON.parse(JSON.stringify(grid)); // hmmmm
    var newKeyboard = JSON.parse(JSON.stringify(keyboard)); // hmmmm
    
    var row = newGrid[currentRowIndex]
    var guess = row.map(letter => letter.value).join('');    
   
    if (!wordDictionary[guess]) {
      row.forEach(function (letter, i) { 
        letter.status = "error";  
      });
    }
    else
    {
      row.forEach(function (letter, i) {    
        if (letter.value == solution.charAt(i)) {
          letter.status = "correct";    
          
          var keyboardLetter = getKeyboardLetter(newKeyboard, letter.value);            
          keyboardLetter.status = "correct";
        }
      });

      row.forEach(function (letter, i) {
        if (letter.status == "correct") {
          return;
        }

        var matchesSoFar = row.filter(item => item.value == letter.value && (item.status == "correct" || item.status == "incorrect-position")).length;
        var matchesInSolution = solution.split('').filter(x => x == letter.value).length;

        letter.status = matchesInSolution > matchesSoFar ? "incorrect-position" : "incorrect";

        if (matchesSoFar == 0)
        {
          var keyboardLetter = getKeyboardLetter(newKeyboard, letter.value);     
          keyboardLetter.status = letter.status;
        }
      });

      if (currentRowIndex >= maxGuesses - 1 || guess == solution)
        setGameStatus("finished");

      setCurrentRowIndex(currentRowIndex + 1);
      setCurrentTileIndex(0);
    }

    setGrid(newGrid);
    setKeyboard(newKeyboard);
  }
    
  var getKeyboardLetter = (keyboard, letter) => {
    var keyboardLetter;

    for (var row = 0; row < keyboard.length; row++) {
      keyboardLetter = keyboard[row].filter(x => x.value == letter);
    
      if (keyboardLetter.length == 1) {
        return keyboardLetter[0];
      }
    }
  }

  return (
    <div className="main">
      <div className="title">{appName}</div>   
      <Grid grid={grid}></Grid>  
      <Keyboard keyboard={keyboard} handleKeyDown={(e) => handleKeyDown(e)}></Keyboard>
      <Introduction></Introduction>
    </div>
  ) 
}

const Grid = ({ grid }) => {
  return (
    <div className="board">
    { 
      grid.map((row, i) => ( 
        <GridRow row={row} key={i}></GridRow>        
      ))
    }
    </div>
  )
}

const GridRow = ({ row, i }) => {
  return (
    <div className="row" > { 
      row.map((tile, j) => ( 
        <GridTile key={`${i}-${j}`} tile={tile}></GridTile>
      ))
    }
    </div>
  )
}

const GridRowExample = ({ word, statusMap, i}) => {
  return (
    <div className="row example">
    { 
      word.split('').map((letter, j) => {
        return (
          <GridTile key={`${i}-${j}`} tile={{ value: letter, status: statusCodes.get(statusMap[j])}}></GridTile>
        )
      })
    }
    </div>
  )
}

const GridTile = ({ tile, i, j }) => {
  return (
     <div className={`tile ${tile.status}`}>
        <div className="inner">
          <div className="front face">{tile.value}</div>     
          <div className="back face">{tile.value}</div>                       
        </div>
      </div>
 )
}

const Keyboard = ({ keyboard, handleKeyDown }) => {
  var handleClick = (letter) => {
    var keyCode = 0;

    if (letter == "Del") {
      keyCode = 8;
    }
    else if (letter == "Enter") {
      keyCode = 13;
    }
    else {
      keyCode = letter.toUpperCase().charCodeAt();
    }

    handleKeyDown({ keyCode: keyCode});
  }

  return (
    <div className="keyboard"> { 
      keyboard.map((row, rowIndex) => ( 
        <div className="keyboard-row" key={rowIndex} row={rowIndex}> { 
          row.map((letter, letterIndex) => ( 
            <div className={`keyboard-letter no-select ${letter.status}`} key={letterIndex} onClick={() => handleClick(letter.value)}>{letter.value}</div>     
          ))
        }   
      </div>
      ))
    }   
    </div>
  )
 };

 const Introduction = () => {
  React.useEffect(() => {
    if (!Cookies.get(introShownCookieName)) {
      setTimeout(() => {
        Cookies.set(introShownCookieName, 'true', { expires: 7 })
        document.getElementById('show-intro').click(); 
      }, 100);
    }
  })

  return (    
  <Popup modal trigger={ <button id="show-intro" type="button" className="button">  </button> } closeOnDocumentClick contentStyle={{ maxWidth: "600px", width: "90%" }} >
  { close => (   
  <div className="modal">
  <a className="close" onClick={close}>&times;</a>
  <div className="content"> 
    <p>Welcome to <b>{appName}</b>, an NFT-enabled version of the popular Wordle game.</p>
    <p>Each guess must be a vaid five-letter word.  Hit the Enter button to submit your guess.</p>
    <p>If you guess the correct word, you will be entered into a daily lottery.  One winner will be selected every day.  The prize is an NFT corresponding to the correct solution, as well as an ether distribution from the pot for that day.</p>
    <p>After each guess, the color of the tiles will change to show how close your guess was to the solution.</p>
    <hr></hr>
    <p><b>Examples</b></p>
    <GridRowExample word={"CHOMP"} statusMap={"X    "} i={0}></GridRowExample>
    <p>The letter <b>C</b> is in the solution and is in the correct spot.</p>
    <GridRowExample word={"BLURT"} statusMap={" O   "} i={1}></GridRowExample>
    <p>The letter <b>L</b> is in the solution but is in the wrong location.</p>
    <GridRowExample word={"SPORK"} statusMap={"  -  "} i={2}></GridRowExample>
    <p>The letter <b>O</b> is not in the solution at any location.</p>
    <hr></hr>
    <p><b>The solution for a given day is unique to every ethereum account.  There's no use in sharing your answer with another user!</b></p>
  </div>
  </div>
  )}
  </Popup>
  )
}
 
 export default App;
