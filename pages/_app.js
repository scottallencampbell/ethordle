import React, { useEffect, useState } from "react";
import '../styles/global.css'
import {words} from '../data/words';
import {solutions} from '../data/solutions';
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
  const [currentSquareIndex, setCurrentSquareIndex] = useState(0);
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
      if (currentSquareIndex >= wordLength) { return; }
      enterLetter(String.fromCharCode(e.keyCode));
    }
    else if (e.keyCode == 8) {      
      if (currentSquareIndex == 0) { return; }
      deleteLetter();
    }
    else if (e.keyCode == 13) {
      if (currentSquareIndex < wordLength) { return; }
      enterWord();
    }
  }

  var enterLetter = (letter) => {
    var newGrid = JSON.parse(JSON.stringify(grid)); // hmmmm
    var thisSquare = newGrid[currentRowIndex][currentSquareIndex];
    
    thisSquare.value = letter;
    thisSquare.status = "entered";    
  
    setGrid(newGrid);
    setCurrentSquareIndex(currentSquareIndex + 1);
  }

  var deleteLetter = () => {
    var newGrid = JSON.parse(JSON.stringify(grid)); // hmmmm
    var thisSquare = newGrid[currentRowIndex][currentSquareIndex - 1];
    
    thisSquare.value = "";
    thisSquare.status = "";

    setGrid(newGrid);
    setCurrentSquareIndex(currentSquareIndex - 1);
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
      setCurrentSquareIndex(0);
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
    </div>
  ) 
}

const Grid = ({ grid }) => {
  return (
    <div className="board">
    { 
      grid.map((row, i) => ( 
        <div key={i} className="row"> { 
          row.map((square, j) => ( 
            <div key={`${i}-${j}`} className={`square ${square.status}`}>
              <div className="inner">
                <div className="front face">{square.value}</div>     
                <div className="back face">{square.value}</div>                       
              </div>
            </div>
          ))
        }
        </div>
      ))
    }
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
        <div className="keyboard-row" key={rowIndex} row={rowIndex}>
        { 
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

 export default App;