export type GridTile = {
   value: string,
   status: TileStatus,
   rowIndex: number,
   tileIndex: number
}

export type KeyboardLetter = {
   value: string,
   status: TileStatus,
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

export type TokenMetadata = {
   url?: string,
   solution: string,
   imageUrl: string,
   guesses: string[],
   secondsRequired: number,
   price: number
}

export enum GameMode {
   Unknown,
   Blockchain,
   Disconnected
}

export enum GameStatus {
   Started,
   Won,
   Lost
}

export enum TileStatus {
   None = 'none',
   Error = 'error',
   Correct = 'correct',
   IncorrectPosition = 'incorrect-position',
   Incorrect = 'incorrect',
   Entered = 'entered',
   EnteredNoAnimation = 'entered-no-animation'
}
