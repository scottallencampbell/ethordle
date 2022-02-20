import { GridRow } from './GridRow';

export const Grid = ({ grid }) => {
   return (
      <div className='grid flippable'>  {
         grid.map((row, i) => (
            <GridRow row={row} key={row[0].rowIndex}></GridRow>
         ))
      }
      </div>
   )
}
