import React, { Component } from 'react';
import '../styles/global.css'
import {words} from '../data/words';
import {solutions} from '../data/solutions';
words.push(...solutions);

let appName = 'ETHORDLE';
let solution = solutions[Math.floor(Math.random() * solutions.length)];
let wordLength = 5;
let maxGuesses = 6;
let startingRow = 0;
let startingSquare = 0;
let letters = [ 
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'], 
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'], 
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Del' ]
  ];

let wordDictionary = Object.assign({}, ...words.map((x) => ({[x]: x})));

console.log(solution); // todo todo

var startingKeyboard = letters.map(row => {
    return row.map(letter => {
      return { value: letter, status: "" };
    });
});

var startingGrid = Array.apply(null, Array(maxGuesses)).map(function () { 
  return Array.apply(null, Array(wordLength)).map(function () { 
    return { value: "", status: "" }; }); })

export default class App extends Component {
  constructor() {
    super();
    this.state = { 
      grid: startingGrid, 
      currentRow: startingRow, 
      currentSquare: startingSquare, 
      keyboard: startingKeyboard,
      status: "started"
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.enterWord = this.enterWord.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }
  
  handleKeyDown(e) {

    if (this.state.status == "finished")
      return;

    if (e.keyCode >= 65 && e.keyCode <= 90) {
     
      if (this.state.currentSquare >= wordLength)
        return;

      this.enterLetter(String.fromCharCode(e.keyCode));
    }
    else if (e.keyCode == 8) {
      
      if (this.state.currentSquare == 0)
        return;

      this.deleteLetter();
    }
    else if (e.keyCode == 13) {

      if (this.state.currentSquare < wordLength)
        return;

      this.enterWord();
    }
  }

  enterLetter(letter) {
    var newGrid = JSON.parse(JSON.stringify(this.state.grid)); // hmmmm
    var thisSquare = newGrid[this.state.currentRow][this.state.currentSquare++];

    thisSquare.value = letter;
    thisSquare.status = "entered";    
    
    this.setState({ grid: newGrid });
  }

  deleteLetter() {
    var newGrid = JSON.parse(JSON.stringify(this.state.grid)); // hmmmm
    var thisSquare = newGrid[this.state.currentRow][--this.state.currentSquare];

    thisSquare.value = "";
    thisSquare.status = "";

    this.setState({ grid: newGrid });
  }
  
  getKeyboardLetter(keyboard, letter) {
    var keyboardLetter;

    for (var row = 0; row < keyboard.length; row++) {
      keyboardLetter = keyboard[row].filter(x => x.value == letter);
    
      if (keyboardLetter.length == 1)
        return keyboardLetter[0];
    }
  }

  enterWord() {
    var newGrid = JSON.parse(JSON.stringify(this.state.grid)); // hmmmm
    var newKeyboard = JSON.parse(JSON.stringify(this.state.keyboard)); // hmmmm
    
    var currentRow = newGrid[this.state.currentRow]
    var guess = currentRow.map(letter => letter.value).join('');    
    var that = this;

    if (!wordDictionary[guess]) {
      currentRow.forEach(function (letter, i) { 
        letter.status = "error";  
      });
    }
    else
    {
      currentRow.forEach(function (letter, i) {    
        if (letter.value == solution.charAt(i)) {
          letter.status = "correct";    
          
          var keyboardLetter = that.getKeyboardLetter(newKeyboard, letter.value);            
          keyboardLetter.status = "correct";
        }
      });

      currentRow.forEach(function (letter, i) {

        if (letter.status == "correct")
          return;

        var matchesSoFar = currentRow.filter(item => item.value == letter.value && (item.status == "correct" || item.status == "incorrect-position")).length;
        var matchesInSolution = solution.split('').filter(x => x == letter.value).length;

        letter.status = matchesInSolution > matchesSoFar ? "incorrect-position" : "incorrect";

        if (matchesSoFar == 0)
        {
          var keyboardLetter = that.getKeyboardLetter(newKeyboard, letter.value);     
          keyboardLetter.status = letter.status;
        }
      });

      if (this.state.currentRow >= maxGuesses - 1 || guess == solution)
        this.state.status = "finished";

      this.state.currentRow++;
      this.state.currentSquare = 0;
    }

    this.setState({ grid: newGrid, keyboard: newKeyboard });
  }

  render() {
    return (
      <div class="main">
        <div class="title">{appName}</div>   
        <Grid grid={this.state.grid}></Grid>  
        <Keyboard keyboard={this.state.keyboard} handleKeyDown={(e) => this.handleKeyDown(e)}></Keyboard>
      </div>
    )
  }
}

class Grid extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div class="board">
      { 
        this.props.grid.map((row, i) => ( 
          <div class="row"> 
          { 
            row.map((square, i) => ( 

              <div className={`square ${square.status}`}>
                <div class="inner">
                  <div class="front face">{square.value}</div>     
                  <div class="back face">{square.value}</div>                       
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
}

class Keyboard extends React.Component {
 
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);    
  }

  handleClick(letter) {

    var keyCode = 0;

    if (letter == "Del")
      keyCode = 8;
    else if (letter == "Enter")
      keyCode = 13;
    else
      keyCode = letter.toUpperCase().charCodeAt();
  
    this.props.handleKeyDown({ keyCode: keyCode});
  }

  render() {
    return (
      <div class="keyboard">
      { 
        this.props.keyboard.map((row, rowIndex) => ( 
          <div class="keyboard-row" key={rowIndex} row={rowIndex}>
          { 
            row.map((letter, letterIndex) => ( 
              <div className={`keyboard-letter no-select ${letter.status}`} key={letterIndex} onClick={() => this.handleClick(letter.value)}>{letter.value}</div>     
             ))
          }   
          </div>
        ))
      }   
      </div>
    )
  }
}