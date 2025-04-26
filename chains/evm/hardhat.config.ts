import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const GOERLI_RPC_URL = process.env.NEXT_PUBLIC_EVM_GOERLI_RPC_URL || "";
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_EVM_SEPOLIA_RPC_URL || "";
const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_EVM_MAINNET_RPC_URL || "";

// Check if necessary environment variables are set
if (!PRIVATE_KEY && process.env.NODE_ENV !== 'test') {
  console.warn("Warning: PRIVATE_KEY is not set in the environment variables.");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    hardhat: {
      // Configuration for the Hardhat Network
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 5,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1,
      // Higher gas price for mainnet
      gasPrice: 50000000000, // 50 gwei
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000 // 40 seconds
  }
};

export default config;
