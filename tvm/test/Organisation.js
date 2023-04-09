var Organisation = artifacts.require("./Organisation.sol");
var Register = artifacts.require("./Register.sol");

contract("Organisation", function(accounts) {

  const METADATA = ["METADATA_URL", "METADATA_URL_2"];
  const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
  let organisation, organisationOwner, otherAccounts;

  before(async function () {
    [organisationOwner, ...otherAccounts] = accounts.map((account) => tronWeb.address.toHex(account));
  
    organisation = await Organisation.new(METADATA[0], organisationOwner, { from: organisationOwner });
  })

  describe("Deployment", function () {

    it("Should have the correct owner", async function() {
      expect(await organisation.owner()).to.equal(organisationOwner);
  });
      
    it("Should set the metadata", async function () {
      expect(await organisation.metadata()).to.equal(METADATA[0]);
    });

  });

  describe("Register deployment", function () {
      
    it("Should deploy a new register by the responsible organisation owner", async function () {      
      // Deploy the first register
      await organisation.deployRegister(METADATA[0]);
      
      expect(await organisation.registers(0)).to.not.be.null;
      expect(await organisation.registers(0)).to.not.equal(NULL_ADDRESS);

      // Deploy the second register
      await organisation.deployRegister(METADATA[1]);
      
      expect(await organisation.registers(1)).to.not.be.null;
      expect(await organisation.registers(1)).to.not.equal(NULL_ADDRESS);
    });

    it("Should not deploy a new register if called not by the responsible organisation owner", async function () {
      organisation.deployRegister(METADATA[0], {from: accounts[1]});
      
      console.log(await organisation.registers(2));
    });
    

    // it("Should emit an event on register deployment", async function () {
    //   const { organisation, organisationOwner } = await loadFixture(deployOrganisationFixture);

    //   await expect(organisation.connect(organisationOwner).deployRegister(METADATA[0]))
    //   .to.emit(organisation, "RegisterDeployed");
    // });

  });

  describe("Update of organisation metadata", function () {

    it("Should update the organisation metadata by the responsible organisation owner", async function () {
      await organisation.editOrganisationMetadata(METADATA[1]);

      expect(await organisation.metadata()).to.equal(METADATA[1]);
    });

    it("Should not update the organisation metadata if called not by the responsible organisation owner", async function () {
      organisation.editOrganisationMetadata(METADATA[0], {from: accounts[1]});

      expect(await organisation.metadata()).not.to.equal(METADATA[0]);
    });

    // it("Should emit an event on organisation metadata update", async function () {
      
    //   const tx = await organisation.editOrganisationMetadata(METADATA[0]).send();
    //   await tronWeb.getEventByTransactionID(tx).then(result => {console.log(result)})
    //   await tronWeb.getEventResult(organisation.address,{eventName:"OrganisationMetadataEdited",size:2}).then(result => {console.log(result)})

    // });

  });
});