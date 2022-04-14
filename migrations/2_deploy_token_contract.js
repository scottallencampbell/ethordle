const EthordleToken = artifacts.require('EthordleToken');

module.exports = function (deployer) {
  let initialPrice = '1000000000000000000';  
  let royaltyRate = '500';  
  let priceEscalationRate = '11000';
  
  deployer.deploy(EthordleToken, 'Ethordle Token', 'ETHORDLE', initialPrice, royaltyRate, priceEscalationRate);
};
