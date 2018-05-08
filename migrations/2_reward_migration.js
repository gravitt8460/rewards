var RewardToken = artifacts.require("RewardToken");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(RewardToken);
};
