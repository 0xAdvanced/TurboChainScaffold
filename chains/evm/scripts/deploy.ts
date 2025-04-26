import { ethers } from "hardhat";
import { formatEther } from "ethers";

async function main() {
  console.log("Starting deployment of Counter contract...");
  
  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying Counter contract with the account: ${deployer.address}`);
    
    // Check account balance
    const accountBalance = await deployer.provider.getBalance(deployer.address);
    console.log(`Account balance: ${formatEther(accountBalance)} ETH`);
    
    // Deploy the counter contract
    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();
    
    console.log(`Counter contract deployed successfully at: ${await counter.getAddress()}`);
    console.log(`Transaction hash: ${counter.deploymentTransaction()?.hash}`);
    
    // Verify deployment
    const count = await counter.count();
    const owner = await counter.owner();
    console.log(`Initial count: ${count}`);
    console.log(`Contract owner: ${owner}`);
    
    console.log("Deployment completed successfully!");
  } catch (error) {
    console.error("Error during deployment:");
    console.error(error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unhandled error during execution:");
  console.error(error);
  process.exitCode = 1;
});
