import * as Entities from '../model/entities';

interface IGrid {
   grid: Entities.GridTile[][]
}

const statusCodes = new Map([
   ['X', Entities.TileStatus.Correct],
   ['O', Entities.TileStatus.IncorrectPosition],
   ['-', Entities.TileStatus.Incorrect],
   [' ', Entities.TileStatus.Entered]
]);

export const Grid = ({ grid } : IGrid) => {
   return (
      <div className='grid flippable hidden-on-load'> {
         grid.map((row, i) => (
            <div className='row' key={`grid-${i}`}> {
               row.map((tile, j) => (
                  <div className='tile-container' key={`grid-${i}-${j}`}>
                     <div className={`tile sequence${tile.tileIndex} ${tile.status}`}>
                        <div className='inner'>
                           <div className='front face'>{tile.value}</div>
                           <div className='back face'>{tile.value}</div>
                        </div>
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
