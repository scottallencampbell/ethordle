const HDWalletProvider = require('truffle-hdwallet-provider');    // Useful for deploying to a public network.
 
module.exports = {
   networks: {
      development: {
         host: "localhost",
         port: 7545,
         network_id: "*"
      },
      rinkeby: {
         provider: () => new HDWalletProvider(`rate offer coast assist liberty mirror boss turtle cheese ten march time`, `https://rinkeby.infura.io/v3/5ec8c547371e4e40808321f428084e66`),
         network_id: 4,       // Ropsten's id
         gas: 5500000,        // Ropsten has a lower block limit than mainnet
         confirmations: 2,    // # of confs to wait between deployments. (default: 0)
         timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
         skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
      }
   },
   contracts_directory: './contracts',
   contracts_build_directory: './abis',
   compilers: {
      solc: {
         version: "0.8.1",
         optimizer: {
         enabled: true,
         runs: 200         
         }
      }
   }
};
