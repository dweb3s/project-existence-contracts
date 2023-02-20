import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";


describe("Organisation", function() {

  const METADATA = "METADATA_URL";
  const SECOND_METADATA = "METADATA_URL_2";

  async function deployOrganisationFixture () {

    const [owner, ...otherAccounts] = await ethers.getSigners();

    const Organisation = await ethers.getContractFactory("Organisation");
    const organisation = await Organisation.deploy(METADATA);

    return {organisation, owner, otherAccounts};
  }

  describe("Deployment", function () {
      
    it("Should set the metadata", async function () {
      const { organisation } = await loadFixture(deployOrganisationFixture);

      expect(await organisation.metadata()).to.equal(METADATA);
    });

  });

  describe("Register deployment", function () {
      
    it("Should deploy a new register by the responsible owner", async function () {
      const { organisation } = await loadFixture(deployOrganisationFixture);

      let registersLength = (organisation.registers).length;
      await organisation.deployRegister(METADATA);

      expect(registersLength++);
    });

    it("Should not deploy a new register if called not by the responsible owner", async function () {
      const { organisation, otherAccounts } = await loadFixture(deployOrganisationFixture);

      await expect(organisation.connect(otherAccounts[0]).deployRegister(METADATA)).to.be.reverted;
    });

    it("Should emit an event on register deployment", async function () {
      const { organisation } = await loadFixture(deployOrganisationFixture);

      await expect(organisation.deployRegister(METADATA))
      .to.emit(organisation, "RegisterDeployed");
    });

  });

  describe("Update of organisation metadata", function () {

    it("Should update the organisation metadata by the responsible owner", async function () {
      const { organisation } = await loadFixture(deployOrganisationFixture);

      await organisation.updateMetadata(SECOND_METADATA);
      expect(String(organisation.metadata) == SECOND_METADATA);

    });

    it("Should not update the organisation metadata if called not by the responsible owner", async function () {
      const { organisation, otherAccounts } = await loadFixture(deployOrganisationFixture);

      await expect(organisation.connect(otherAccounts[0]).updateMetadata(SECOND_METADATA)).to.be.reverted;
    });

    it("Should emit an event on organisation metadata update", async function () {
      const { organisation } = await loadFixture(deployOrganisationFixture);

      await expect(organisation.updateMetadata(SECOND_METADATA))
      .to.emit(organisation, "OrganisationMetadataUpdated");
    });

  });

});