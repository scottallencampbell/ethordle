import * as Entities from '../model/entities';

interface IGridTile {
   tile: Entities.GridTile
}

export const GridTile = ({ tile } : IGridTile) => {
   return (
      (tile.value != ' ') ? 
      <div className='tile-container'>
         <div className={`tile sequence${tile.tileIndex} ${tile.status}`}>
            <div className='inner'>
               <div className='front face'>{tile.value}</div>
               <div className='back face'>{tile.value}</div>
            </div>
         </div>
      </div>
      : <span> </span>      
   )
}