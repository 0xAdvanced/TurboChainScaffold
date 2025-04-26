# 🛠 TurboChainScaffold 开发指南

本指南帮助开发者理解并使用 TurboChainScaffold 多链开发框架。

## 📋 目录

- [环境设置](#环境设置)
- [项目结构](#项目结构)
- [EVM 链开发](#evm-链开发)
- [Solana 链开发](#solana-链开发)
- [Sui 链开发](#sui-链开发)
- [Aptos 链开发](#aptos-链开发)
- [TON 链开发](#ton-链开发)
- [前端开发](#前端开发)
- [自动化脚本](#自动化脚本)
- [部署流程](#部署流程)
- [CI/CD 流程](#cicd-流程)

## 环境设置

### 前提条件

- Node.js (v18+)
- Yarn (v1.22+)
- Rust (用于 Solana/Sui/Aptos)
- Solana CLI (用于 Solana)
- Sui CLI (用于 Sui)
- Aptos CLI (用于 Aptos)
- TON CLI (用于 TON)

### 初始化开发环境

```bash
# 克隆仓库
git clone https://github.com/your-username/TurboChainScaffold.git
cd TurboChainScaffold

# 安装依赖
yarn install

# 拷贝环境变量文件
cp .env.example .env
# 编辑 .env 文件添加你的API密钥和私钥
```

## 项目结构

```
TurboChainScaffold/
├─┐ chains/                  # 各链智能合约
│ ├── evm/                  # EVM智能合约 (Solidity)
│ ├── solana/               # Solana程序 (Rust + Anchor)
│ ├── sui/                  # Sui模块 (Move)
│ ├── aptos/                # Aptos模块 (Move)
│ └── ton/                  # TON合约 (Tact/FunC)
│
├─┐ apps/                    # 应用程序
│ └── dapp-ui/              # 前端DApp (Next.js)
│
├─┐ scripts/                 # 自动化脚本
│ ├── deploy.sh             # 合约部署脚本
│ ├── test-all.sh           # 多链测试脚本
│ ├── sync-abis.js          # ABI同步脚本
│ └── faucet-all.ts         # 测试币获取脚本
│
├─┐ docs/                    # 文档
│ ├── DEVELOPMENT.md        # 开发指南 (本文档)
│ ├── CHANGELOG.md          # 更新日志
│ └── CONTRIBUTING.md       # 贡献指南
│
├─┐ .github/                 # GitHub配置
│ └── workflows/            # GitHub Actions工作流
│
└── turbo.json               # TurboRepo配置
```

## EVM 链开发

EVM链使用Hardhat框架和Solidity语言开发智能合约。

### 合约开发

合约位于 `chains/evm/contracts/` 目录。

```bash
# 编译合约
cd chains/evm
npx hardhat compile

# 运行测试
npx hardhat test

# 部署到测试网
npx hardhat run scripts/deploy.ts --network sepolia
```

### 环境变量

在 `chains/evm/.env` 文件中设置：

```
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_sepolia_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Solana 链开发

Solana链使用Anchor框架和Rust语言开发程序。

### 程序开发

程序位于 `chains/solana/programs/` 目录。

```bash
# 构建程序
cd chains/solana
anchor build

# 运行测试
anchor test

# 部署到devnet
anchor deploy --provider.cluster devnet
```

## Sui 链开发

Sui链使用Move语言开发模块。

### 模块开发

模块位于 `chains/sui/` 目录。

```bash
# 编译模块
cd chains/sui
sui move build

# 测试模块
sui move test

# 发布模块
sui client publish --gas-budget 10000
```

## Aptos 链开发

Aptos链使用Move语言开发模块。

### 模块开发

模块位于 `chains/aptos/` 目录。

```bash
# 编译模块
cd chains/aptos
aptos move compile

# 测试模块
aptos move test

# 发布模块
aptos move publish --profile default
```

## TON 链开发

TON链使用Tact/FunC语言开发智能合约。

### 合约开发

合约位于 `chains/ton/` 目录。

```bash
# 编译合约
cd chains/ton
tact compile

# 部署合约
tact deploy
```

## 前端开发

前端使用Next.js, TailwindCSS和Web3钱包连接库开发。

### 启动开发服务器

```bash
cd apps/dapp-ui
yarn dev
```

### 构建生产版本

```bash
cd apps/dapp-ui
yarn build
```

### 添加新链支持

要在前端添加新链支持：

1. 在 `apps/dapp-ui/contracts/abis/` 目录下添加新的ABI/IDL文件
2. 创建相应的连接组件和钱包适配器
3. 更新页面组件以支持新链交互

## 自动化脚本

### 部署脚本

使用 `scripts/deploy.sh` 部署合约：

```bash
# 部署EVM合约到Sepolia
bash scripts/deploy.sh evm ethereum-sepolia

# 部署Solana合约到devnet
bash scripts/deploy.sh solana
```

### ABI同步脚本

使用 `scripts/sync-abis.js` 同步ABI到前端：

```bash
# 同步EVM合约ABI
node scripts/sync-abis.js evm

# 同步所有链合约ABI
node scripts/sync-abis.js all
```

## 部署流程

### 手动部署

1. 编译合约: `cd chains/<chain> && <compile-command>`
2. 部署合约: `bash scripts/deploy.sh <chain> [network]`
3. 同步ABI: `node scripts/sync-abis.js <chain>`
4. 构建前端: `cd apps/dapp-ui && yarn build`
5. 部署前端: `cd apps/dapp-ui && yarn deploy` (如果有自定义部署命令)

### 使用GitHub Actions自动部署

1. 设置GitHub仓库Secrets:
   - `EVM_ENV`: EVM链的环境变量
   - `SOLANA_ENV`: Solana链的环境变量
   - `VERCEL_TOKEN`: Vercel部署令牌
   - `VERCEL_ORG_ID`: Vercel组织ID
   - `VERCEL_PROJECT_ID`: Vercel项目ID

2. 使用GitHub Actions部署:
   - 推送到 `main` 分支自动部署到生产环境
   - PR预览自动部署
   - 手动触发合约部署工作流

## CI/CD 流程

项目使用GitHub Actions自动化CI/CD流程。

### CI/CD工作流

- `ci-vercel.yml`: 构建、测试和部署前端
- `deploy-contracts.yml`: 部署智能合约和同步ABI

### Vercel前端部署

前端自动部署到Vercel:
- 每个PR创建预览部署
- 合并到main分支部署到生产环境

## 贡献指南

请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何贡献代码。 