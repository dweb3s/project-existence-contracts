// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Register.sol";

contract Organisation is Ownable {

    address[] public registers;
    string public metadata;

    event RegisterDeployed (address register);
    event OrganisationMetadataUpdated (address organisation, string metadata);


    constructor (string memory _metadata, address _organisationOwner) {
        metadata = _metadata;
        transferOwnership(_organisationOwner);
    }

    function deployRegister (
        string calldata _registerMetadata
    )
        public 
        onlyOwner()
    {
        Register newRegister = new Register(address(this)/*address of organisation*/, _registerMetadata);
        registers.push(address(newRegister));

        emit RegisterDeployed(address(newRegister));
    }

    function updateOrganisationMetadata (
        string calldata _metadata
    ) 
        public 
        onlyOwner()
    {
        metadata = _metadata;
        
        emit OrganisationMetadataUpdated(address(this)/*address of organisation*/, _metadata);
    }
    
}