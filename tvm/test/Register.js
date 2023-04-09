var Register = artifacts.require("./Register.sol");


contract("Register", function() {

  const METADATA = ["METADATA_URL", "METADATA_URL_2"];
  const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
  let organisation, admin, recordCreator, recordInvalidator, registerEditor, otherAccounts;

  before(async function () {
    [admin, recordCreator, recordInvalidator, registerEditor, otherAccounts] = accounts.map((account) => tronWeb.address.toHex(account));
  
    register = await Register.new(METADATA[0], admin);
  })

  async function deployRegisterFixture () {

    const [admin, organisation, recordCreator, recordInvalidator, registerEditor, ...otherAccounts] = await ethers.getSigners();
    //get signers/accounts

    const Register = await ethers.getContractFactory("Register");
    const register = await Register.deploy(METADATA[0], admin.address);

    return {register, organisation, admin, recordCreator, recordInvalidator, registerEditor, otherAccounts};

  }

  describe("Deployment", function () {
      
      it("Should set the organisation", async function () {
        const { register, organisation } = await loadFixture(deployRegisterFixture);
  
        expect(await register.organisation()).to.not.equal(NULL_ADDRESS);
      });

      it("Should set the metadata", async function () {
        const { register } = await loadFixture(deployRegisterFixture);
  
        expect(await register.metadata()).to.equal(METADATA[0]);
      });

      it("Should grant DEFAULT_ADMIN_ROLE, RECORD_CREATOR, RECORD_INVALIDATOR and REGISTER_EDITOR to the admin", async function () {
        const { register, admin } = await loadFixture(deployRegisterFixture);
        const DEFAULT_ADMIN_ROLE = await register.DEFAULT_ADMIN_ROLE();
        const RECORD_CREATOR = await register.RECORD_CREATOR();
        const RECORD_INVALIDATOR = await register.RECORD_INVALIDATOR();
        const REGISTER_EDITOR = await register.REGISTER_EDITOR();

        expect(await register.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
        expect(await register.hasRole(RECORD_CREATOR, admin.address)).to.be.true;
        expect(await register.hasRole(RECORD_INVALIDATOR, admin.address)).to.be.true;
        expect(await register.hasRole(REGISTER_EDITOR, admin.address)).to.be.true;
      });

  });

  describe("Roles", function () {

    it("Should grant RECORD_CREATOR to the account by the admin", async function () {
      const { register, recordCreator } = await loadFixture(deployRegisterFixture);
      const ACCOUNT_ADDRESS = recordCreator.address;
      const RECORD_CREATOR = await register.RECORD_CREATOR();

      await register.grantRole(RECORD_CREATOR, ACCOUNT_ADDRESS);

      expect(await register.hasRole(RECORD_CREATOR, ACCOUNT_ADDRESS)).to.be.true;
    });

    it("Should grant RECORD_INVALIDATOR to the account by the admin", async function () {
      const { register, recordInvalidator } = await loadFixture(deployRegisterFixture);
      const ACCOUNT_ADDRESS = recordInvalidator.address;
      const RECORD_INVALIDATOR = await register.RECORD_INVALIDATOR();

      await register.grantRole(RECORD_INVALIDATOR, ACCOUNT_ADDRESS);

      expect(await register.hasRole(RECORD_INVALIDATOR, ACCOUNT_ADDRESS)).to.be.true;
    });

    it("Should grant REGISTER_EDITOR to the account by the admin", async function () {
      const { register, registerEditor } = await loadFixture(deployRegisterFixture);
      const ACCOUNT_ADDRESS = registerEditor.address;
      const REGISTER_EDITOR = await register.REGISTER_EDITOR();

      await register.grantRole(REGISTER_EDITOR, ACCOUNT_ADDRESS);

      expect(await register.hasRole(REGISTER_EDITOR, ACCOUNT_ADDRESS)).to.be.true;
    });

    it("Not the admin should not be able to grant any role", async function () {
      const { register, otherAccounts } = await loadFixture(deployRegisterFixture);
      const ACCOUNT_ADDRESS = otherAccounts[1].address;
      const RECORD_CREATOR = await register.RECORD_CREATOR();
      const RECORD_INVALIDATOR = await register.RECORD_INVALIDATOR();
      const REGISTER_EDITOR = await register.REGISTER_EDITOR();

      await expect(register.connect(otherAccounts[0]).grantRole(RECORD_CREATOR, ACCOUNT_ADDRESS)).to.be.reverted;
      await expect(register.connect(otherAccounts[0]).grantRole(RECORD_INVALIDATOR, ACCOUNT_ADDRESS)).to.be.reverted;
      await expect(register.connect(otherAccounts[0]).grantRole(REGISTER_EDITOR, ACCOUNT_ADDRESS)).to.be.reverted;
    });

  });

  describe("Update of register metadata", function () {

    it("Should update the register metadata by the responsible register editor", async function () {
      const { register, registerEditor } = await loadFixture(deployRegisterFixture);
      const REGISTER_EDITOR = await register.REGISTER_EDITOR();

      await register.grantRole(REGISTER_EDITOR, registerEditor.address);

      await register.editRegisterMetadata(METADATA[1]);
      expect(String(register.metadata) == METADATA[1]);
    });

    it("Should not update the register metadata if called not by the responsible register editor", async function () {
      const { register, otherAccounts } = await loadFixture(deployRegisterFixture);

      await expect(register.connect(otherAccounts[0]).editRegisterMetadata(METADATA[1])).to.be.reverted;
    });

    it("Should emit an event on register metadata update", async function () {
      const { register } = await loadFixture(deployRegisterFixture);

      await expect(register.editRegisterMetadata(METADATA[1]))
      .to.emit(register, "RegisterMetadataEdited");
    });

  });


  describe("Records", function () {
    
    const DOCUMENT_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const SECOND_DOCUMENT_HASH = '0x7894567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const THIRD_DOCUMENT_HASH = '0x5464567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const SOURCE_DOCUMENT = "SOURCE_DOCUMENT_URL";
    const REFERENCE_DOCUMENT = "REFERENCE_DOCUMENT_URL";
    const STARTS_AT = 0;
    const EXPIRES_AT = 0;
    const PAST_DOCUMENT_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
    //set record data for the test

    describe("Events", function () {

      it("Should emit an event on record creation", async function () {
        const { register } = await loadFixture(deployRegisterFixture);
  
        await expect(register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        ))
        .to.emit(register, "RecordCreated")
        .withArgs(DOCUMENT_HASH);
      });

      it("Should emit an event on record update (for either previous record or just record)", async function () {
        const { register } = await loadFixture(deployRegisterFixture);

        await register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )

        await expect(register.createRecord(
          SECOND_DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          DOCUMENT_HASH
        ))
        .to.emit(register, "RecordUpdated")
        .withArgs(DOCUMENT_HASH);

        await expect(register.invalidateRecord(SECOND_DOCUMENT_HASH))
        .to.emit(register, "RecordUpdated")
        .withArgs(SECOND_DOCUMENT_HASH);
      });

      it("Should emit an event on record invalidation", async function () {
        const { register } = await loadFixture(deployRegisterFixture);

        await register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )

        await expect(register.invalidateRecord(DOCUMENT_HASH))
        .to.emit(register, "RecordInvalidated")
        .withArgs(DOCUMENT_HASH);
      });

    });

    describe("New record creation", function () {

      it("Should create a new record by the responsible record creator", async function () {
        const { register, recordCreator } = await loadFixture(deployRegisterFixture);
        const RECORD_CREATOR = await register.RECORD_CREATOR() //get RECORD_CREATOR from register
  
        await register.grantRole(RECORD_CREATOR, recordCreator.address);
        await register.connect(recordCreator).createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        ) 
        const record = await register.records(DOCUMENT_HASH);
                
        expect(record).not.to.be.null;
        expect(record.creator).to.equal(recordCreator.address);   
        expect(record.sourceDocument).to.equal(SOURCE_DOCUMENT);
        expect(record.referenceDocument).to.equal(REFERENCE_DOCUMENT);
        expect(record.startsAt).to.equal(STARTS_AT);
        expect(record.expiresAt).to.equal(EXPIRES_AT);
        expect(record.pastDocumentHash).to.equal(PAST_DOCUMENT_HASH);
        //check if the data in record is the same as was provided
      });

      it("Should not create a record given the document hash that already exists", async function () {
        const { register } = await loadFixture(deployRegisterFixture);

        await register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )

        await expect(register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        ))
        .to.be.reverted
      });

      it("Should not create a new record if called not by the responsible record creator", async function () {
        const { register, otherAccounts } = await loadFixture(deployRegisterFixture);

        await expect(register.connect(otherAccounts[0]).createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )).to.be.reverted;
      });

    });

    describe("Record invalidation", function () {

      it("Should invalidate a non-attached record by the responsible record invalidator", async function () {
        const { register, recordInvalidator } = await loadFixture(deployRegisterFixture);
        const RECORD_INVALIDATOR = await register.RECORD_INVALIDATOR();
  
        await register.grantRole(RECORD_INVALIDATOR, recordInvalidator.address);
        await register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )
        await register.connect(recordInvalidator).invalidateRecord(DOCUMENT_HASH);
        const record = await register.records(DOCUMENT_HASH);
  
        expect(record.expiresAt).to.not.equal(0);
        expect(record.updatedAt).to.not.equal(0);
        expect(record.expiresAt).to.equal(record.updatedAt);
      });

      it("Should not invalidate already invalidated/expired record", async function () {
        const { register } = await loadFixture(deployRegisterFixture);

        await register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )
        await register.invalidateRecord(DOCUMENT_HASH);
        
        await expect(register.invalidateRecord(DOCUMENT_HASH)).to.be.reverted;
      });

      it("Should not invalidate a record if called not by the responsible record invalidator", async function () {
        const { register, otherAccounts } = await loadFixture(deployRegisterFixture);
  
        await register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )
  
        await expect(register.connect(otherAccounts[0]).invalidateRecord(DOCUMENT_HASH)).to.be.reverted;
      });

    });

    describe("New record attachment", function () {

      it("Should create a new record attached to another record by the responsible record creator", async function () {
        const { register, recordCreator } = await loadFixture(deployRegisterFixture);
        const RECORD_CREATOR = await register.RECORD_CREATOR() //get RECORD_CREATOR from register
  
        await register.grantRole(RECORD_CREATOR, recordCreator.address);  
        await register.connect(recordCreator).createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )
        await register.connect(recordCreator).createRecord(
          SECOND_DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          DOCUMENT_HASH
        )
        const record = await register.records(DOCUMENT_HASH);
  
        expect(record.updater).to.equal(recordCreator.address);
        expect(record.expiresAt).to.not.equal(0);
        expect(record.updatedAt).to.not.equal(0);
        expect(record.nextDocumentHash).to.equal(SECOND_DOCUMENT_HASH);
        //check if the data in firstRecord was changed correctly
  
        const nextRecord = await register.records(SECOND_DOCUMENT_HASH);
  
        expect(nextRecord).not.to.be.null;
        expect(nextRecord.creator).to.equal(recordCreator.address);   
        expect(nextRecord.sourceDocument).to.equal(SOURCE_DOCUMENT);
        expect(nextRecord.referenceDocument).to.equal(REFERENCE_DOCUMENT);
        expect(nextRecord.startsAt).to.equal(STARTS_AT);
        expect(nextRecord.expiresAt).to.equal(EXPIRES_AT);
        expect(nextRecord.pastDocumentHash).to.equal(DOCUMENT_HASH);
        //check if the data in secondRecord is the same as was provided
      });
  
      it("Should not attach a record to the record which already has another record attached to it", async function () {
        const { register } = await loadFixture(deployRegisterFixture);
  
        await register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )
        await register.createRecord(
          SECOND_DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          DOCUMENT_HASH
        )

        await expect(register.createRecord(
          THIRD_DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          DOCUMENT_HASH
        )).to.be.reverted;
      });
  
      it("Should not update a 0x00 previous record when the newly created record has no previous record", async function () {
        const { register } = await loadFixture(deployRegisterFixture);
  
        await register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )  
        const record = await register.records(PAST_DOCUMENT_HASH);
  
        expect(record.updater).to.equal(NULL_ADDRESS);
        expect(record.createdAt).to.equal(0);
        expect(record.updatedAt).to.equal(0);
        expect(record.nextDocumentHash).to.equal(NULL_HASH);
        //check if the data in 0x00 record is unchanged
      });
  
      it("Should not create a new attached record if at the previousDocumentHash there is no record", async function () {
        const { register } = await loadFixture(deployRegisterFixture);
  
        await expect(register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          THIRD_DOCUMENT_HASH
        ))
        .to.be.reverted
      });

      it("Should not create a new record attached to another record if called not by the responsible record creator", async function () {
        const { register, otherAccounts } = await loadFixture(deployRegisterFixture);
  
        await register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )
        
        await expect(register.connect(otherAccounts[0]).createRecord(
          SECOND_DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          DOCUMENT_HASH
        )).to.be.reverted;
      });

      it("Should not change expiresAt for pastRecord if it was already expired", async function () {
        const { register } = await loadFixture(deployRegisterFixture);

        await register.createRecord(
          DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          PAST_DOCUMENT_HASH
        )
        await register.invalidateRecord(DOCUMENT_HASH);
        await register.createRecord(
          SECOND_DOCUMENT_HASH,
          SOURCE_DOCUMENT,
          REFERENCE_DOCUMENT,
          STARTS_AT,
          EXPIRES_AT,
          DOCUMENT_HASH
        )

        const record = await register.records(DOCUMENT_HASH);

        expect(record.expiresAt != record.updatedAt);
        //console.log("Record was expired at ", record.expiresAt);
        //console.log("Record was updated at ", record.updatedAt);
      });

    });
  
  });

});