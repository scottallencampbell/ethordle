import { GridTile } from './GridTile';

const statusCodes = new Map([
   ['X', 'correct'],
   ['O', 'incorrect-position'],
   ['-', 'incorrect'],
   [' ', 'entered']
]);

export const GridRow = ({ row }) => {
   return (
      <div className='row' > {
         row.map((tile) => (
            <GridTile key={`${row[0].rowIndex}-${tile.tileIndex}`} tile={tile}></GridTile>
         ))
      }
      </div>
   )
}

export const StaticGridRow = ({ word, statusMap, i }) => {
   return (
      <div className='row example'> {
         word.split('').map((letter, j) => {
            return (
               <GridTile key={`${i}-${j}`} tile={{ value: letter, tileIndex: j, status: statusCodes.get(statusMap[j]) }}></GridTile>
            )
         })
      }
      </div>
   )
}
