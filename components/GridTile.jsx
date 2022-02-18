export const GridTile = ({ tile }) => {
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