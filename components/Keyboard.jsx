export const Keyboard = ({ keyboard, handleKeyDown }) => {
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
      <div className='keyboard'> {
         keyboard.map((row, rowIndex) => (
            <div className='keyboard-row' key={rowIndex} row={rowIndex}> {
               row.map((letter, letterIndex) => (
                  <div className={`keyboard-letter ${letter.status} ${letter.sequence ?? ''}`} key={letterIndex} onClick={() => handleClick(letter.value)}>{letter.value}</div>
               ))
            }
            </div>
         ))
      }
      </div>
   )
};
