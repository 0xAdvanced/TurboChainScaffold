# 🚀 TurboChainScaffold

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Build](https://github.com/your-username/TurboChainScaffold/actions/workflows/ci-vercel.yml/badge.svg)](https://github.com/your-username/TurboChainScaffold/actions)
[![Vercel Deploy](https://vercel.badge)](https://vercel.com)

---

## 🚀 项目简介

**TurboChainScaffold** 是一个基于 **TurboRepo** 构建的环境环节，模块化，支持多链智能合约与前端一体化开发脚手架。

支持链：
- ✅ EVM（Ethereum, Goerli, Sepolia, Polygon, BSC 等）
- ✅ Solana（Devnet, Mainnet-beta）
- ✅ Sui（Devnet, Testnet, Mainnet）
- ✅ Aptos（Devnet, Testnet, Mainnet）
- ✅ TON（Testnet, Mainnet）

内置：多链钩绑，一键部署，前端 ABI/IDL 自动同步，Faucet 测试币领取，多链 Dashboard，TurboRepo 构建加速。

---

## 🏧 项目结构

```
TurboChainScaffold/
├─┐ chains/       # EVM, Solana, Sui, Aptos, TON 合约及部署脚本
├─┐ apps/dapp-ui/  # 前端 DApp（Next.js + RainbowKit + WalletAdapter）
├─┐ shared/        # 通用工具库（链管理）
├─┐ scripts/       # 自动化脚本（部署/测试/同步 ABI）
├─┐ docs/          # 文档模板和项目指南
├─┐ .github/       # CI/CD 配置（GitHub Actions）
├─┐ .env.example   # 环境变量模板
├─┐ turbo.json     # TurboRepo 管理配置
├─┐ README.md
└─┐ package.json   # Yarn Workspace 管理
```

---

## 🔥 核心功能

- ⚡️ TurboRepo Monorepo 架构（构建极速）
- ⚡️ 多链智能合约统一管理
- ⚡️ 多链多钩绑支持（Metamask, RainbowKit, Phantom, Solflare, Backpack, Tonkeeper, Sui Wallet）
- ⚡️ 合约 ABI/IDL 自动同步至前端
- ⚡️ 一键部署（支持链名+子网络选择）
- ⚡️ Faucet 测试币一键领取
- ⚡️ Dashboard 多链资产总览页
- ⚡️ GitHub Actions + Vercel 自动部署

---

## 🛃️ Roadmap

- [x] EVM, Solana, Sui, Aptos, TON 多链开发支持
- [x] TurboRepo 加速构建
- [x] Faucet 测试币领取脚本
- [x] ABI/IDL 同步至前端
- [x] 多链切换+链管理
- [x] GitHub Actions + Vercel Preview
- [ ] 子图索引（TheGraph, Sui Indexer）
- [ ] 跨链消息通信（LayerZero, Hyperlane）
- [ ] 全链账户管理（ERC6551/Session Key）

---

## 🛋️ 安装与使用

```bash
# 克隆仓库
git clone https://github.com/your-username/TurboChainScaffold.git
cd TurboChainScaffold

# 安装依赖
yarn install

# 编译 & 测试合约
bash scripts/test-all.sh

# 部署指定链合约
bash scripts/deploy.sh evm ethereum-goerli

# 运行前端 DApp
cd apps/dapp-ui
yarn dev
```

---

## 🧬 技术栈

- Hardhat + Solidity (EVM)
- Anchor + Rust (Solana)
- Sui Move CLI (Sui)
- Aptos Move CLI (Aptos)
- Tact CLI (TON)
- Next.js + TailwindCSS + TypeScript
- wagmi + RainbowKit (EVM)
- wallet-adapter-react (Solana)
- TurboRepo
- GitHub Actions + Vercel

---

## 📄 License

MIT License © 2024-present

---

## 👌 感谢支持

如果你喜欢这个项目，欢迎点一下【Star】！
如果需要高级定制版或商业合作，请直接联系作者。

---
