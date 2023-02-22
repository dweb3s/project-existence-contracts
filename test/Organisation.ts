import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";


describe("Organisation", function() {

  const METADATA = ["METADATA_URL", "METADATA_URL_2"]

  async function deployOrganisationFixture () {

    const [factoryOwner, organisationOwner, ...otherAccounts] = await ethers.getSigners();

    const Organisation = await ethers.getContractFactory("Organisation");
    const organisation = await Organisation.deploy(METADATA[0], organisationOwner.address);

    return {organisation, organisationOwner, otherAccounts};
  }

  describe("Deployment", function () {

    it("Should set the organisation owner", async function () {
      const { organisation, organisationOwner } = await loadFixture(deployOrganisationFixture);

      expect(await organisation.owner()).to.equal(organisationOwner.address);
    });
      
    it("Should set the metadata", async function () {
      const { organisation } = await loadFixture(deployOrganisationFixture);

      expect(await organisation.metadata()).to.equal(METADATA[0]);
    });

  });

  describe("Register deployment", function () {
      
    it("Should deploy a new register by the responsible organisation owner", async function () {
      const { organisation, organisationOwner } = await loadFixture(deployOrganisationFixture);

      // Deploy the first register
      await organisation.connect(organisationOwner).deployRegister(METADATA[0]);
      // Check that the first register has been added to the array
      expect(await organisation.registers(0)).to.not.be.null;
      expect(await organisation.registers(0)).to.not.equal(ethers.constants.AddressZero);

      // Deploy the second register
      await organisation.connect(organisationOwner).deployRegister(METADATA[1]);
      // Check that the second register has been added to the array
      expect(await organisation.registers(1)).to.not.be.null;
      expect(await organisation.registers(1)).to.not.equal(ethers.constants.AddressZero);
    });

    it("Should not deploy a new register if called not by the responsible organisation owner", async function () {
      const { organisation, otherAccounts } = await loadFixture(deployOrganisationFixture);

      await expect(organisation.connect(otherAccounts[0]).deployRegister(METADATA[0])).to.be.reverted;
    });

    it("Should emit an event on register deployment", async function () {
      const { organisation, organisationOwner } = await loadFixture(deployOrganisationFixture);

      await expect(organisation.connect(organisationOwner).deployRegister(METADATA[0]))
      .to.emit(organisation, "RegisterDeployed");
    });

  });

  describe("Update of organisation metadata", function () {

    it("Should update the organisation metadata by the responsible organisation owner", async function () {
      const { organisation, organisationOwner } = await loadFixture(deployOrganisationFixture);

      await organisation.connect(organisationOwner).editOrganisationMetadata(METADATA[1]);
      expect(String(organisation.metadata) == METADATA[1]);

    });

    it("Should not update the organisation metadata if called not by the responsible organisation owner", async function () {
      const { organisation, otherAccounts } = await loadFixture(deployOrganisationFixture);

      await expect(organisation.connect(otherAccounts[0]).editOrganisationMetadata(METADATA[1])).to.be.reverted;
    });

    it("Should emit an event on organisation metadata update", async function () {
      const { organisation, organisationOwner } = await loadFixture(deployOrganisationFixture);

      await expect(organisation.connect(organisationOwner).editOrganisationMetadata(METADATA[1]))
      .to.emit(organisation, "OrganisationMetadataEdited");
    });

  });

});