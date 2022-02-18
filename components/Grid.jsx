import { GridTile } from './GridTile'

export const Grid = ({ grid }) => {
   return (
      <div className='board'>
         {
            grid.map((row, i) => (
               <GridRow row={row} key={row[0].rowIndex}></GridRow>
            ))
         }
      </div>
   )
}

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
