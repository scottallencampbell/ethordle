import { GridTile } from './GridTile';

interface IGridRow {
   row: Entities.GridTile[]
}

interface IStaticGridRow {
   word: string,
   statusMap: string,
   i: number
}

const statusCodes = new Map([
   ['X', 'correct'],
   ['O', 'incorrect-position'],
   ['-', 'incorrect'],
   [' ', 'entered']
]);

export const GridRow = ({ row } : IGridRow) => {
   return (
      <div className='row' > {
         row.map((tile) => (
            <GridTile key={`${row[0].rowIndex}-${tile.tileIndex}`} tile={tile}></GridTile>
         ))
      }
      </div>
   )
}

export const StaticGridRow = ({ word, statusMap, i } : IStaticGridRow) => {
   return (
      <div className='row example'> {
         word.split('').map((letter, j) => {
            return (
               <GridTile key={`${i}-${j}`} tile={{ value: letter, tileIndex: j, rowIndex: i, status: statusCodes.get(statusMap[j]) }}></GridTile>
            )
         })
      }
      </div>
   )
}
