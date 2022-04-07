import { useEffect } from "react";
import { StaticGridRow } from "./GridRow";

interface ITitle {
   title: string
}

export const Title = ({ title }: ITitle) => {
   useEffect(() => {
      setTimeout(() => {
            document.getElementById('title').classList.add('flippable');
         }, 100);
      }, [])

   return (
   <div id='title' className='title'>
      <StaticGridRow word={title} statusMap={'XXXXXXXX'} i={0}></StaticGridRow>
   </div>
   )
}