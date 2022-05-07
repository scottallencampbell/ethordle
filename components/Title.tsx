import { useEffect } from 'react';
import { StaticGridRow } from './StaticGridRow';

interface ITitle {
   title: string
}

export const Title = ({ title } : ITitle) => {
   useEffect(() => {
      setTimeout(() => {
            document.getElementById('title').classList.add('flippable');
         }, 100);
      }, [])

   return (
   <div id='title' className={title.length >= 10 ? 'very-long' : ''}>
      <StaticGridRow word={title} statusMap={'XXXXXXXXXXXXXXXXXXXXXX'}></StaticGridRow>   
   </div>
   )
}
