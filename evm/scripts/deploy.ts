import { ethers } from "hardhat";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);

  const Lock = await ethers.getContractFactory("OrganisationFactory");
  const lock = await Lock.deploy();
  await lock.deployed();

  console.log(`Deployed organisation factory to ${lock.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
