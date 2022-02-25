import { GridRow } from '../GridRow';
import { IGridTileInfo } from '../../pages/index';

interface IGrid {
   grid: IGridTileInfo[][]
}

export const Grid = ({ grid } : IGrid) => {
   return (
      <div className='grid flippable'> {
         grid.map((row) => (
            <GridRow row={row} key={row[0].rowIndex}></GridRow>
         ))
      }
      </div>
   )
}
