#!/bin/bash

# 安装Solana依赖脚本
# 这个脚本帮助安装Solana钱包适配器和web3.js依赖

echo "开始安装Solana依赖..."

# 确保在正确的目录
cd $(dirname "$0")
cd ../apps/dapp-ui

# 检查是否已安装npm
if ! [ -x "$(command -v npm)" ]; then
  echo "错误: npm未安装" >&2
  exit 1
fi

# 安装Solana相关依赖
echo "安装Solana Web3.js和钱包适配器..."
npm install \
  @solana/web3.js \
  @solana/wallet-adapter-base \
  @solana/wallet-adapter-react \
  @solana/wallet-adapter-react-ui \
  @solana/wallet-adapter-wallets

# 检查安装结果
if [ $? -eq 0 ]; then
  echo "Solana依赖安装成功! ✅"
  echo "现在您可以使用Solana钱包连接器组件。"
else
  echo "安装过程中出现错误，请检查日志。"
  exit 1
fi

# 提供使用说明
echo ""
echo "=== 使用说明 ==="
echo "1. 在_app.tsx中已添加Solana钱包适配器"
echo "2. 使用SolanaConnector组件连接Solana钱包"
echo "3. 设置环境变量NEXT_PUBLIC_SOLANA_RPC_URL来配置RPC端点"
echo ""

exit 0 