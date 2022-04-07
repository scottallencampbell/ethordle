import * as Entities from '../model/entities';

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
      <div className='keyboard hidden-on-load'> {
         keyboard.map((row) => (
            <div className='keyboard-row' key={row[0].rowIndex}> {
               row.map((key) => (
                  <div className={`keyboard-letter ${key.status} ${key.sequence ?? ''}`} key={`${row[0].rowIndex}-${key.keyIndex}`} onClick={() => handleClick(key.value)}>{key.value}</div>
               ))
            }
            </div>
         ))
      }
      </div>
   )
};
