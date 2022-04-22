import { GridTile } from './GridTile';
import * as Entities from '../model/entities';

interface IGridRow {
   row: Entities.GridTile[]
}

interface IStaticGridRow {
   word: string,
   statusMap: string,
   i: number
}

const statusCodes = new Map([
   ['X', Entities.TileStatus.Correct],
   ['O', Entities.TileStatus.IncorrectPosition],
   ['-', Entities.TileStatus.Incorrect],
   [' ', Entities.TileStatus.Entered]
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
   let spacer = 0;

   return (
      <div className='row example'> {
         word.split('').map((letter, j) => {
            return (
               <>
               { letter.toString() != ' ' ? 
               <GridTile key={`${i}-${j}`} tile={{ value: letter, tileIndex: j, rowIndex: i, status: statusCodes.get(statusMap[j]) }}></GridTile>
               : <span> </span>             
               }
               </>             
            )
         })
      }            
      </div>
   )
}
