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

export class Token {
   // loaded from blockchain
   public id: number;
   public owner: string;
   public price: number;
   public url: string;
   public solution: string;
   public isForSale: boolean;
   public transactionCount: number;
   // loaded from metadata
   public imageUrl: string;
   public guesses: string[];
   public secondsRequired: number;

   public constructor(init?:Partial<Token>) {
      Object.assign(this, init);
   }
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
