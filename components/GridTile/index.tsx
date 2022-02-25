import { IGridTileInfo} from '../../pages/index';

interface IGridTile {
   tile: IGridTileInfo
}

export const GridTile = ({ tile } : IGridTile) => {
   return (
      <div className='tile-container'>
         <div className={`tile sequence${tile.tileIndex} ${tile.status}`}>
            <div className='inner'>
               <div className='front face'>{tile.value}</div>
               <div className='back face'>{tile.value}</div>
            </div>
         </div>
      </div>
   )
}