const EthordleToken = artifacts.require("EthordleToken");

module.exports = function (deployer) {
  deployer.deploy(EthordleToken, "Ethordle Token", "ETHORDLE");
};

