export type GridTile = {
   value: string,
   status: TileStatus
}

export type KeyboardLetter = {
   value: string,
   status: TileStatus,
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
   public lastPrice: number;
   public url: string;
   public solution: string;
   public isForSale: boolean;
   public lastTransactionTimestamp: string;
   public transactionCount: number;
   // loaded from metadata
   public image: string;
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
