import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // 1. 部署ARTToken
  console.log("Deploying ARTToken...");
  const ARTToken = await ethers.getContractFactory("ARTToken");
  const artToken = await upgrades.deployProxy(
    ARTToken, 
    ["Asset Referenced Token", "ART", deployer.address],
    { initializer: 'initialize', kind: 'uups' }
  );
  await artToken.waitForDeployment();
  console.log("ARTToken deployed to:", await artToken.getAddress());
  
  // 2. 部署EMTToken
  console.log("Deploying EMTToken...");
  const EMTToken = await ethers.getContractFactory("EMTToken");
  const emtToken = await upgrades.deployProxy(
    EMTToken, 
    ["Euro E-Money Token", "EEMT", deployer.address, "EUR", "European E-Money Issuer Ltd."],
    { initializer: 'initialize', kind: 'uups' }
  );
  await emtToken.waitForDeployment();
  console.log("EMTToken deployed to:", await emtToken.getAddress());
  
  // 输出合约地址
  console.log("\nDeployment Summary:");
  console.log("ARTToken (Proxy):", await artToken.getAddress());
  console.log("EMTToken (Proxy):", await emtToken.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 