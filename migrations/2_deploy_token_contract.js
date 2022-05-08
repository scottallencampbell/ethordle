const EthordleToken = artifacts.require('EthordleToken');

module.exports = function (deployer) {
  const initialPrice = '10000000000000000';   // 0.01 ETH
  const minimumPrice = '10000000000000000';
  const royaltyRate = '500';  
  const priceEscalationRate = '11000';
  const password = '6f59cd20cec44b199378da22815dcd9a';
  
  deployer.deploy(EthordleToken, 'Ethordle Token', 'ETHORDLE', initialPrice, minimumPrice, royaltyRate, priceEscalationRate, password);
};
