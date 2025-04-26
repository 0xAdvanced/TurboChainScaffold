#!/bin/bash

CHAIN=$1
SUBCHAIN=$2

if [ -z "$CHAIN" ]; then
  echo "❌ 请指定主链：evm / solana / sui / aptos / ton"
  exit 1
fi

case $CHAIN in
  evm)
    if [ -z "$SUBCHAIN" ]; then
      echo "🛠️ 请选择 EVM 子网络："
      echo "- ethereum-mainnet (chainId 1)"
      echo "- ethereum-goerli (chainId 5)"
      echo "- ethereum-sepolia (chainId 11155111)"
      echo "- bsc-mainnet (chainId 56)"
      echo "- polygon-mainnet (chainId 137)"
      exit 1
    fi

    case $SUBCHAIN in
      ethereum-mainnet)
        echo "🚀 Deploying to Ethereum Mainnet..."
        cd chains/evm && npx hardhat run scripts/deploy.ts --network mainnet
        ;;
      ethereum-goerli)
        echo "🚀 Deploying to Goerli..."
        cd chains/evm && npx hardhat run scripts/deploy.ts --network goerli
        ;;
      ethereum-sepolia)
        echo "🚀 Deploying to Sepolia..."
        cd chains/evm && npx hardhat run scripts/deploy.ts --network sepolia
        ;;
      bsc-mainnet)
        echo "🚀 Deploying to BSC..."
        cd chains/evm && npx hardhat run scripts/deploy.ts --network bsc
        ;;
      polygon-mainnet)
        echo "🚀 Deploying to Polygon..."
        cd chains/evm && npx hardhat run scripts/deploy.ts --network polygon
        ;;
      *)
        echo "❌ 不支持的 EVM 子网络: $SUBCHAIN"
        exit 1
        ;;
    esac
    ;;

  solana)
    echo "🚀 Deploying to Solana..."
    cd chains/solana && anchor deploy
    ;;

  sui)
    echo "🚀 Deploying to Sui..."
    cd chains/sui && sui client publish --gas-budget 10000
    ;;

  aptos)
    echo "🚀 Deploying to Aptos..."
    cd chains/aptos && aptos move publish --profile default
    ;;

  ton)
    echo "🚀 Deploying to TON..."
    cd chains/ton && tact deploy contracts/Counter.tact
    ;;

  *)
    echo "❌ 不支持的主链: $CHAIN"
    exit 1
    ;;
esac
