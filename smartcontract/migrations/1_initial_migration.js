const Election = artifacts.require("ElectionT");

module.exports = function (deployer) {
  deployer.deploy(Election);
};

