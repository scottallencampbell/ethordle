const EthordleGame = artifacts.require("EthordleGame");

module.exports = function (deployer) {
  deployer.deploy(EthordleGame);
};
