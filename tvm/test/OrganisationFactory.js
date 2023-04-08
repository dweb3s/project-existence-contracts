var OrganisationFactory = artifacts.require("./OrganisationFactory.sol");

contract("OrganisationFactory", function(accounts) {

  const METADATA = ["METADATA_URL", "METADATA_URL_2"];
  let organisationFactory, factoryOwner, organisationOwner, otherAccounts;

  before(async function () {
    [factoryOwner, organisationOwner, ...otherAccounts] = accounts;

    organisationFactory = await OrganisationFactory.deployed()
  })

  describe("Deployment", function () {

    it("Should set the organisation factory owner", async function () {
      expect(await organisationFactory.owner()).to.equal(tronWeb.address.toHex(factoryOwner));
    });
      
    it("Should set the fees to zero", async function () {
      const organisationDeploymentFee = await organisationFactory.organisationDeploymentFee();
      const registerDeploymentFee = await organisationFactory.registerDeploymentFee();
      const recordDeploymentFee = await organisationFactory.recordDeploymentFee();
    
      expect(organisationDeploymentFee.toNumber()).to.equal(0);
      expect(registerDeploymentFee.toNumber()).to.equal(0);
      expect(recordDeploymentFee.toNumber()).to.equal(0);
    });
    

  });

  describe("Organisation deployment", function () {

    it("Should deploy a new organisation and emit an event on organisation deployment", function (done) {
      this.timeout(15000)

      OrganisationFactory.deployed()
        .then(organisationFactory => {
          return tronWeb.contract().at(organisationFactory.address)
              .then(async organisationFactory2 => {
                const orgDeployEvent = await organisationFactory2.OrganisationDeployed().watch((err, res) => {
                  if(res) {
                    try {
                      //console.log(res.result);

                      assert.equal(res.result.organisationOwner, tronWeb.address.toHex(organisationOwner));
                      assert.equal(res.result.organisation, organisationAddress);

                      orgDeployEvent.stop();
                      done();
                    } catch (error) {
                      orgDeployEvent.stop();
                      done(error);
                    }
                  }
                });
    
                await organisationFactory.deployOrganisation(METADATA[0], tronWeb.address.toHex(organisationOwner));
                const organisationAddress = await organisationFactory.organisationsOfOwner(tronWeb.address.toHex(organisationOwner), 0);
                
              });
        });
    });

  });

});