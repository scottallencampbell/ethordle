namespace Entities {

   export type GridTile = {
      value: string,
      status: string,
      rowIndex: number,
      tileIndex: number
   }

   export type KeyboardLetter = {
      value: string,
      status: string,
      rowIndex: number,
      keyIndex: number,
      sequence?: number
   }

   export type Statistics = {
      gamesPlayed: number,
      gamesWon: number,
      streak: number,
      guesses: number[],
      solution: string,
      averageGuesses?: number
   }
}