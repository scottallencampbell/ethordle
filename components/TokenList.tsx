import React from 'react';
import { useEffect, useState } from 'react';
import { ModeChooser } from './ModeChooser';
import { Title } from './Title';
import { Token } from './Token';
import * as Entities from '../models/entities';
import { useCrypto } from '../contexts/useCrypto';
import Link from 'next/link';

interface ITokenList {
   isMarketplace: boolean,
   title: string,
   tokens: Entities.Token[],
   account: string
}

let nullBoolean : boolean | null;

export const TokenList = ({ isMarketplace, title, tokens, account }: ITokenList) => {

   const { blockchainStatus, validateBlockchain } = useCrypto();
   const [gameMode, setGameMode] = useState(Entities.GameMode.Unknown);
   const [isGameModePopupOpen, setIsGameModePopupOpen] = useState(nullBoolean);

   useEffect(() => {
      setTimeout(() => {
         document.querySelectorAll('#token-list .token').forEach(token => {
            const image = token.querySelector('img');
            // @ts-ignore
            if (!image.complete) {
               // @ts-ignore
               image.src = '/image-not-available.png';
               token.classList.add('no-image');
            }
         });
      }, 5000);
   }, []);

   return (    
      <div className='main'>
         <Title title={title}></Title>
         { tokens.length === 0 && !isMarketplace ?        
            <div id='no-tokens' className='vertically-centered hidden-on-load'>
               <img src='./crying-emoji.png'></img>
               <p>We&apos;re sorry, this account currently owns no tokens.</p>
               <p>Why not play a <Link href='/'>new game</Link> in order to mint a token?</p>
            </div> 
            :
            <div className='hidden-on-load'>
               {account === '' || !tokens ? null :
                  <div id='token-list' className={isMarketplace ? 'is-marketplace' : 'is-not-marketplace'}>
                     { tokens.map((token, i) => (
                        <Token token={token} index={i} key={i}></Token>                        
                     ))}
                  </div>
               }
            </div>
         }
         <ModeChooser setGameMode={setGameMode} isGameModePopupOpen={isGameModePopupOpen} setIsGameModePopupOpen={setIsGameModePopupOpen}></ModeChooser>
      </div>
   )
}
