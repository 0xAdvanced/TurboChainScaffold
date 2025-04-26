import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Upgrading contracts with the account:", deployer.address);
  
  // 获取已部署合约的地址 (需要替换为实际的代理地址)
  const ART_PROXY_ADDRESS = process.env.ART_PROXY_ADDRESS || "";
  const EMT_PROXY_ADDRESS = process.env.EMT_PROXY_ADDRESS || "";
  
  if (!ART_PROXY_ADDRESS && !EMT_PROXY_ADDRESS) {
    console.error("错误: 请在环境变量中设置至少一个代理地址");
    process.exit(1);
  }
  
  // 升级ARTToken (如果提供了地址)
  if (ART_PROXY_ADDRESS) {
    console.log("Upgrading ARTToken...");
    const ARTTokenV2 = await ethers.getContractFactory("ARTToken"); // 使用新版合约
    const artToken = await upgrades.upgradeProxy(ART_PROXY_ADDRESS, ARTTokenV2);
    await artToken.waitForDeployment();
    console.log("ARTToken upgraded at:", await artToken.getAddress());
  }
  
  // 升级EMTToken (如果提供了地址)
  if (EMT_PROXY_ADDRESS) {
    console.log("Upgrading EMTToken...");
    const EMTTokenV2 = await ethers.getContractFactory("EMTToken"); // 使用新版合约
    const emtToken = await upgrades.upgradeProxy(EMT_PROXY_ADDRESS, EMTTokenV2);
    await emtToken.waitForDeployment();
    console.log("EMTToken upgraded at:", await emtToken.getAddress());
  }
  
  console.log("\nUpgrade completed successfully");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 