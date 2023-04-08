var OrganisationFactory = artifacts.require("./OrganisationFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(OrganisationFactory);
};