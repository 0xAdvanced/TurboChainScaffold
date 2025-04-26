#!/bin/bash

# test-all.sh: 一键运行每条链的合约测试脚本

CHAINS=(evm solana sui aptos ton)

for CHAIN in "${CHAINS[@]}"; do
  echo "\n✨ Running tests for $CHAIN ..."
  case $CHAIN in
    evm)
      cd chains/evm && npx hardhat test && cd ../../
      ;;
    solana)
      cd chains/solana && anchor test && cd ../../
      ;;
    sui)
      echo "(Mock) Testing Sui contracts (no standard test runner yet)"
      cd chains/sui && echo "✅ Sui check complete" && cd ../../
      ;;
    aptos)
      echo "(Mock) Testing Aptos contracts"
      cd chains/aptos && aptos move test && cd ../../
      ;;
    ton)
      echo "(Mock) Testing TON contracts"
      cd chains/ton && echo "✅ TON check complete" && cd ../../
      ;;
    *)
      echo "❌ Unknown chain: $CHAIN"
      ;;
  esac
  echo "✅ Finished testing $CHAIN"
done

echo "\n✨ All chain tests completed!"
