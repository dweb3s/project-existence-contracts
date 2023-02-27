// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Register.sol";

contract Organisation is Ownable {

    address[] public registers;
    string public metadata;

    event RegisterDeployed (address register, address registerAdmin);
    event OrganisationMetadataEdited (address organisation, string metadata);


    constructor (string memory _metadata, address _organisationOwner) {
        metadata = _metadata;
        transferOwnership(_organisationOwner);
    }

    function deployRegister (
        string calldata _registerMetadata,
        address _registerAdmin
    )
        public 
        onlyOwner()
    {
        Register newRegister = new Register(_registerMetadata, _registerAdmin);
        registers.push(address(newRegister));

        emit RegisterDeployed(address(newRegister), _registerAdmin);
    }

    function editOrganisationMetadata (
        string calldata _metadata
    ) 
        public 
        onlyOwner()
    {
        metadata = _metadata;
        
        emit OrganisationMetadataEdited(address(this)/*address of organisation*/, _metadata);
    }
    
}