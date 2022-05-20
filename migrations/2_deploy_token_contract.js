const EthordleToken = artifacts.require('EthordleToken');

module.exports = function (deployer) {
  // const initialPrice = '10000000000000000';   // 0.01 ETH
  const initialPrice = '0';   
  const minimumPrice = '5000000000000000'; // 0.005 ETH
  const royaltyRate = '500';  
  const priceEscalationRate = '11000';
  const password = '6f59cd20cec44b199378da22815dcd9a';
  const beneficiary = '0x742C92633C2bd92Eb1f04C5939dA8fF661D0E610';
  
  deployer.deploy(EthordleToken, 'Ethordle Token', 'ETHORDLE', initialPrice, minimumPrice, royaltyRate, priceEscalationRate, password, beneficiary);
};
