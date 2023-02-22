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
      
    it("Should deploy a new organisation by the responsible factory owner", async function () {
      const { organisationFactory, organisationOwner } = await loadFixture(deployOrganisationFactoryFixture);

      const tx = await organisationFactory.deployOrganisation(METADATA[0], organisationOwner.address);
      const receipt = await tx.wait();
      const organisationAddress = receipt.events?.find((event) => event.event === "OrganisationDeployed")?.args?.organisation;
      
      expect(organisationAddress).to.not.be.undefined;
      expect(await organisationFactory.organisations(organisationAddress)).to.be.true;
    });

    it("Should not deploy a new organisation if called not by the responsible factory owner", async function () {
      const { organisationFactory, otherAccounts, organisationOwner } = await loadFixture(deployOrganisationFactoryFixture);

      await expect(organisationFactory.connect(otherAccounts[0]).deployOrganisation(METADATA[0], organisationOwner.address)).to.be.reverted;
    });

    it("Should emit an event on organisation deployment", async function () {
      const { organisationFactory, organisationOwner } = await loadFixture(deployOrganisationFactoryFixture);

      await expect(organisationFactory.deployOrganisation(METADATA[0], organisationOwner.address))
      .to.emit(organisationFactory, "OrganisationDeployed");
    });

  });

});