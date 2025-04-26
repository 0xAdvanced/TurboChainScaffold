# 🔖 RELEASE.md

## TurboChainScaffold v1.0.0

### 新功能
- 支持 EVM, Solana, Sui, Aptos, TON 多链开发
- 支持 TurboRepo Monorepo 构建加速
- 支持多链多钩绑链切换
- 自动同步合约 ABI/IDL 到前端
- Faucet 测试币领取脚本
- GitHub Actions + Vercel Preview 流水线


# 🖌️ Project Structure Diagram

```plaintext
TurboChainScaffold/
├── apps/
│   └── dapp-ui/
├── chains/
│   ├── aptos/
│   ├── evm/
│   ├── solana/
│   ├── sui/
│   └── ton/
├── shared/
├── scripts/
├── docs/
├── package.json
├── turbo.json
├── .env.example
└── README.md
```