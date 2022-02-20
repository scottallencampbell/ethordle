import { useEffect } from "react";
import { StaticGridRow } from "./GridRow";

export const Title = ({ title }) => {
   useEffect(() => {
      setTimeout(() => {
            document.getElementById('title').classList.add('flippable');
         }, 1);
      }, [])

   return (
   <div id='title' class='title'>
      <StaticGridRow word={title} statusMap={'XXXXXXXX'} i={0}></StaticGridRow>
   </div>
   )
}