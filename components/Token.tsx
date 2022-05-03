import { useEffect, useState } from 'react';
import { Toggle } from './Toggle';
import { PriceChooser } from '../components/PriceChooser';
import * as Entities from '../model/entities';
import { useCrypto } from '../context/useCrypto';
import { Transfer } from './Transfer';

interface IToken {
   token: Entities.Token,
   index: number
}

export const Token = ({ token, index }: IToken) => {
   const { buyToken } = useCrypto();
   const { allowTokenSale, preventTokenSale } = useCrypto();
   const { account, isContractOwner } = useCrypto();

   const [newPrice, setNewPrice] = useState(token.price);
   const [isForSale, setIsForSale] = useState(token.isForSale);
   const [isPriceChooserOpen, setIsPriceChooserOpen] = useState(false);
   const [isTransferPopupOpen, setIsTransferPopupOpen] = useState(false);
   const [status, setStatus] = useState('');

   const handleToggle = async () => {
      if (!token.isForSale) {
         setNewPrice(token.price);
         setIsPriceChooserOpen(true);
      } else {
         await preventTokenSale(token.id);
         setStatus('transacting');
         setIsForSale(false);
      }
   }

   const handleSetTokenForSale = async () => {
      setIsPriceChooserOpen(false);
      await allowTokenSale(token.id, newPrice);
      setStatus('transacting');
      setIsForSale(true);
   }

   const handleBuyToken = async () => {
      await buyToken(token.id, token.price);
      setStatus('transacting');
   }

   const handleTransferToken = async () => {
      await buyToken(token.id, token.price);

   }

   useEffect(() => {

      setStatus(`${token.isForSale ? 'for-sale' : 'not-for-sale'}${token.owner == account ? '-by-this-owner' : ''}`);

   }, [account, token]);

   return (
      <div className={`token ${token.image == '' ? 'no-metadata' : ''} ${status}`} key={`token-${index}`}>
         {(token.owner == account && !token.isForSale) ?
            <PriceChooser token={token} newPrice={newPrice} setNewPrice={setNewPrice} isPriceChooserOpen={isPriceChooserOpen} setIsPriceChooserOpen={setIsPriceChooserOpen} handleSetTokenForSale={handleSetTokenForSale} solution={token.solution}></PriceChooser>
            : <></>
         }
         <img src={token.image == '' ? '/metadata-not-available.png' : token.image} key={`token-image-${index}`}></img>
         {isContractOwner ?
            <div>
               <Transfer isTransferPopupOpen={isTransferPopupOpen} setIsTransferPopupOpen={setIsTransferPopupOpen} token={token} handleTransferToken={handleTransferToken} ></Transfer>
               <button className='material-button transfer' role='button' onClick={() => setIsTransferPopupOpen(true)}><span className='material-icons md-18'>&#xe5c8;</span>Transfer</button>
            </div>
            : <></>}
         <div className='disclaimer-metadata'>This token&apos;s metadata is currently being saved to the blockchain.<br /><br />Please wait 10 minutes and refresh your browser.</div>
         <div className='disclaimer-image'>This token&apos;s image is currently being saved to the blockchain.<br /><br />Please wait 10 minutes and refresh your browser.</div>
         <div className='links'>
            <strong title='Metadata' onClick={() => window.open(token.url)} className='material-icons smaller'>&#xe54e;</strong>
            <strong title='Image' onClick={() => window.open(token.image)} className='material-icons'>&#xea10;</strong>
            <strong title='Owner' onClick={() => window.open(`https://etherscan.io/address/${token.owner}`)} className='material-icons'>&#xe7fd;</strong>
         </div>
         <div className='details'>
            <div className='details-column'>
               <div className='solution'>
                  <p>Solution</p>
                  <strong>{token.solution}</strong>
                  <strong>{isContractOwner ? 'true' : 'false'}</strong>
               </div>
               <div className='guess-result'>
                  <p>Guesses</p>
                  <strong>
                     {token.guesses.map((guess, j) => (
                        <div key={`token-${index}-${j}`}>
                           {guess.split('').map((letter, k) => (
                              <span key={`token-${index}-${j}-${k}`} className={letter}> </span>
                           ))}
                        </div>
                     ))}
                  </strong>
               </div>
               <div className='seconds'>
                  <p>Time to solve</p>
                  <strong>{token.secondsRequired}s</strong>
               </div>
            </div>
            <div className='details-column'>
               <div className={`price price-length-${token.price.toString().length}`}>
                  <p>Current Price</p>
                  <strong><img className='ethereum-icon' src='/ethereum-icon.png'></img> {token.price}</strong>
               </div>
               <div className='clear'></div>
               <div className='last-transaction'>
                  <p>Last transaction (UTC)</p>
                  <strong>{token.lastTransactionTimestamp}</strong>
                  <strong><img className='ethereum-icon' src='/ethereum-icon.png'></img> {token.lastPrice}</strong>
               </div>
               <div className='for-sale-status'>
                  {(token.owner == account) ?
                     <Toggle id={`toggle-${token.id}}`} isOn={token.isForSale} handleToggle={handleToggle} onText='For sale' offText='Not for sale' />
                     :
                     <></>
                  }
               </div>
               <div className='buy'>
                  <button className='material-button status-transacting pinwheel' disabled role='button'><span></span>Working...</button>
                  <button className='material-button status-for-sale-by-this-owner' disabled role='button'><span className='material-icons md-18'>&#xef76;</span>For sale</button>
                  <button className='material-button status-not-for-sale-by-this-owner' disabled role='button'><span className='material-icons md-18'>&#xe897;</span>Not for sale</button>
                  <button className='material-button status-for-sale' role='button' onClick={handleBuyToken}><span className='material-icons md-18'>&#xe854;</span>Purchase</button>
                  <button className='material-button status-not-for-sale' disabled role='button'><span className='material-icons md-18'>&#xe897;</span>Not for Sale</button>
               </div>
            </div>
         </div>
      </div>
   )
}
