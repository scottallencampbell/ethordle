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
   // Calculated
   public marketplaceStatus: TokenStatus

   public constructor(init?:Partial<Token>) {
      Object.assign(this, init);
   }
}

export enum TokenStatus {
   Unknown = 'unknown',
   ForSale = 'for-sale',
   NotForSale = 'not-for-sale',
   ForSaleByThisAccount = 'for-sale-by-this-account',
   NotForSaleByThisAccount = 'not-for-sale-by-this-account',
   Transacting = 'transacting'
}

export enum GameMode {
   Unknown = 'Unknown',
   Blockchain = 'Blockchain',
   Disconnected = 'Disconnected'
}

export enum GameStatus {
   Started = 'started',
   Won = 'won',
   Lost = 'lost'
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

export enum BlockchainStatus {
   Unknown = 'unknown',
   Connected = 'connected',
   NotConnected = 'not-connected',
   NoEthereum = 'no-ethereum',
   NoGas = 'no-gas',
   ConnectionTimeout = 'connection-timeout'
}

export enum TransactionStatus {
   Inactive = 'inactive',
   Active = 'active',
   Error = 'error'
}