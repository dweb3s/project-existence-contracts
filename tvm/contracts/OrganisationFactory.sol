// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./Organisation.sol";

contract OrganisationFactory is Ownable {
    mapping(address => bool) public organisations;
    mapping(address => address[]) public organisationsOfOwner;

    uint256 public organisationDeploymentFee = 0;
    uint256 public registerDeploymentFee = 0;
    uint256 public recordDeploymentFee = 0;

    event OrganisationDeployed(address organisation, address organisationOwner);
    event FeesUpdated(
        uint256 organisationDeploymentFee,
        uint256 registerDeploymentFee,
        uint256 recordCreationFee
    );

    function setFees(
        uint256 _organisationDeploymentFee,
        uint256 _registerDeploymentFee,
        uint256 _recordDeploymentFee
    ) public onlyOwner {
        organisationDeploymentFee = _organisationDeploymentFee;
        registerDeploymentFee = _registerDeploymentFee;
        recordDeploymentFee = _recordDeploymentFee;

        emit FeesUpdated(
            _organisationDeploymentFee,
            _registerDeploymentFee,
            _recordDeploymentFee
        );
    }

    function deployOrganisation(
        string calldata _organisationMetadata,
        address _organisationOwner
    ) public {
        Organisation newOrganisation = new Organisation(
            _organisationMetadata,
            _organisationOwner
        );
        organisations[address(newOrganisation)] = true;
        organisationsOfOwner[_organisationOwner].push(address(newOrganisation));

        emit OrganisationDeployed(address(newOrganisation), _organisationOwner);
    }
}
