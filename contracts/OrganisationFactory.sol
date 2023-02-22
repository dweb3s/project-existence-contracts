// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Organisation.sol";

contract OrganisationFactory is Ownable {

    mapping (address => bool) public organisations;

    uint public organisationDeploymentFee = 0;
    uint public registerDeploymentFee = 0;
    uint public recordDeploymentFee = 0;

    event OrganisationDeployed (address organisation, address organisationOwner);
    event FeesUpdated(uint organisationDeploymentFee, uint registerDeploymentFee, uint recordCreationFee);


    function setFees (
        uint _organisationDeploymentFee,
        uint _registerDeploymentFee,
        uint _recordDeploymentFee
    )
        public
        onlyOwner()
    {
        organisationDeploymentFee = _organisationDeploymentFee;
        registerDeploymentFee = _registerDeploymentFee;
        recordDeploymentFee = _recordDeploymentFee;

        emit FeesUpdated(_organisationDeploymentFee, _registerDeploymentFee, _recordDeploymentFee);
    }

    function deployOrganisation (
        string calldata _organisationMetadata,
        address _organisationOwner
    )
        public
        onlyOwner()
    {
        Organisation newOrganisation = new Organisation(_organisationMetadata, _organisationOwner);
        organisations[address(newOrganisation)] = true;

        emit OrganisationDeployed(address(newOrganisation), _organisationOwner);
    }

}