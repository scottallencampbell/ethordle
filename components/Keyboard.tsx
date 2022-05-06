import * as Entities from '../models/entities';

interface IKeyboard {
   keyboard: Entities.KeyboardLetter[][],
   handleKeyDown: Function
}

export const Keyboard = ({ keyboard, handleKeyDown } : IKeyboard) => {
   var handleClick = (letter) => {
      var keyCode = 0;

      if (letter == 'Del') {
         keyCode = 8;
      }
      else if (letter == 'Enter') {
         keyCode = 13;
      }
      else {
         keyCode = letter.toUpperCase().charCodeAt();
      }

      handleKeyDown({ keyCode: keyCode });
   }

   return (
      <div id='keyboard' className='hidden-on-load'> {
         keyboard.map((row, i) => (
            <div className='keyboard-row' key={`keyboard-${i}`}> {
               row.map((key, j) => (
                  <div className={`keyboard-letter ${key.status} ${key.sequence == null ? '' : `sequence${key.sequence}`}`} key={`keyboard-${i}-${j}`} onClick={() => handleClick(key.value)}>{key.value}</div>
               ))
            }
            </div>
         ))
      }
      </div>
   )
};
