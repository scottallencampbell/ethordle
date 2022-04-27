const EthordleToken = artifacts.require('EthordleToken');

module.exports = function (deployer) {
  let initialPrice = '10000000000000000';   // 0.01 ETH
  let royaltyRate = '500';  
  let priceEscalationRate = '11000';
  
  deployer.deploy(EthordleToken, 'Ethordle Token', 'ETHORDLE', initialPrice, royaltyRate, priceEscalationRate);
};
