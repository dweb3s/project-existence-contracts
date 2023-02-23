import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";


describe("OrganisationFactory", function() {

  const METADATA = ["METADATA_URL", "METADATA_URL_2"];

  async function deployOrganisationFactoryFixture () {

    const [factoryOwner, organisationOwner, ...otherAccounts] = await ethers.getSigners();

    const OrganisationFactory = await ethers.getContractFactory("OrganisationFactory");
    const organisationFactory = await OrganisationFactory.deploy();

    return {organisationFactory, factoryOwner, organisationOwner, otherAccounts};
  }

  describe("Deployment", function () {

    it("Should set the organisation factory owner", async function () {
      const { organisationFactory, factoryOwner } = await loadFixture(deployOrganisationFactoryFixture);

      expect(await organisationFactory.owner()).to.equal(factoryOwner.address);
    });
      
    it("Should set the fees to zero", async function () {
      const { organisationFactory } = await loadFixture(deployOrganisationFactoryFixture);
      const organisationDeploymentFee = await organisationFactory.organisationDeploymentFee();
      const registerDeploymentFee = await organisationFactory.registerDeploymentFee();
      const recordDeploymentFee = await organisationFactory.recordDeploymentFee();

      expect(organisationDeploymentFee).to.equal(0);
      expect(registerDeploymentFee).to.equal(0);
      expect(recordDeploymentFee).to.equal(0);
    });

  });

  describe("Organisation deployment", function () {
      
    it("Should deploy a new organisation", async function () {
      const { organisationFactory, organisationOwner } = await loadFixture(deployOrganisationFactoryFixture);

      const tx = await organisationFactory.deployOrganisation(METADATA[0], organisationOwner.address);
      const receipt = await tx.wait();
      const organisationAddress = receipt.events?.find((event) => event.event === "OrganisationDeployed")?.args?.organisation;
      
      expect(organisationAddress).to.not.be.undefined;
      expect(await organisationFactory.organisations(organisationAddress)).to.be.true;
      expect(await organisationFactory.organisationsOfOwner(organisationOwner.address, 0)).to.equal(organisationAddress);
      expect(await organisationFactory.getNumberOfOwnerOrganisations(organisationOwner.address)).to.equal(1);

      /*
      await organisationFactory.deployOrganisation(METADATA[0], organisationOwner.address);
      const NUMBER_OF_ORGANISATIONS = await organisationFactory.getNumberOfOwnerOrganisations(organisationOwner.address);
      for(let i=0; i < NUMBER_OF_ORGANISATIONS.toNumber(); i++){
        console.log(await organisationFactory.organisationsOfOwner(organisationOwner.address, i));
      }
      */
    });

    it("Should emit an event on organisation deployment", async function () {
      const { organisationFactory, organisationOwner } = await loadFixture(deployOrganisationFactoryFixture);

      await expect(organisationFactory.deployOrganisation(METADATA[0], organisationOwner.address))
      .to.emit(organisationFactory, "OrganisationDeployed");
    });

  });

});