import * as Entities from '../models/entities';

interface IStaticGridRow {
    word: string,
    statusMap: string
 }
 
 const statusCodes = new Map([
    ['X', Entities.TileStatus.Correct],
    ['O', Entities.TileStatus.IncorrectPosition],
    ['-', Entities.TileStatus.Incorrect],
    [' ', Entities.TileStatus.Entered]
 ]);
 
 export const StaticGridRow = ({ word, statusMap } : IStaticGridRow) => {
    return (
       <div key={word}> {
            [...word].map((letter, i) => (
            letter !== ' ' ?
                <div className='tile-container' key={`title-${i}`} >
                    <div className={`tile sequence${i} ${statusCodes.get(statusMap[i])}`}>
                        <div className='inner'>
                            <div className='front face'>{letter}</div>
                            <div className='back face'>{letter}</div>
                        </div>
                    </div>
                </div>
                : 
                <div className='tile-container space' key={`title-${i}`} >                   
                </div>
            ))
       }            
       </div>
    )
 }
 