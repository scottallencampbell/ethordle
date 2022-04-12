const EthordleToken = artifacts.require('EthordleToken');

module.exports = function (deployer) {

  // let price = 5000000;  // 5m gwei = 0.005 ETH  
  let price = 1000000000;  
  //let royalty = 500;  // 500 basis points = 5%
  let royalty = 5000;  

  deployer.deploy(EthordleToken, 'Ethordle Token', 'ETHORDLE', price, royalty);
};
