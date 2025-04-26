# Solana设置指南

本文档提供了在TurboChainScaffold项目中设置和使用Solana钱包连接的完整指南。

## 安装依赖

项目已经包含了一个方便的脚本来安装所有Solana相关的依赖：

```bash
bash scripts/install-solana.sh
```

这个脚本将安装以下依赖：
- @solana/web3.js - Solana的核心JavaScript API
- @solana/wallet-adapter-base - 基础钱包适配器接口
- @solana/wallet-adapter-react - React钩子和上下文提供者
- @solana/wallet-adapter-react-ui - UI组件
- @solana/wallet-adapter-wallets - 流行钱包的适配器实现

## 配置环境变量

编辑项目根目录下的`.env.local`文件（如果不存在则创建），添加以下变量：

```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_COUNTER_ADDRESS=你的合约地址
```

您可以根据需要使用Devnet、Testnet或Mainnet-beta的RPC URL。

## 使用Solana钱包适配器

项目已经在`_app.tsx`文件中配置了Solana钱包适配器。这包括：

1. 导入必要的组件
2. 设置Solana网络连接
3. 配置多个钱包适配器，包括Phantom、Solflare、Backpack等
4. 使用ConnectionProvider和WalletProvider包装应用程序

## SolanaConnector组件

项目包含一个完整的`SolanaConnector.tsx`组件，可以在任何页面中使用。这个组件提供：

1. 钱包连接/断开功能
2. 计数器合约交互（增加/减少/重置）
3. 错误处理和加载状态
4. 用户友好的UI

用法示例：

```tsx
import SolanaConnector from '../components/SolanaConnector';

export default function SolanaPage() {
  return (
    <div>
      <h1>Solana测试页面</h1>
      <SolanaConnector />
    </div>
  );
}
```

## 支持的钱包

默认配置支持以下Solana钱包：

- Phantom
- Solflare
- Backpack
- Brave
- Coinbase
- Math Wallet
- Clover
- Slope
- Torus

如果需要添加更多钱包，可以修改`_app.tsx`文件中的`wallets`数组。

## 自定义样式

Solana钱包适配器的默认样式已经包含在项目中。如果需要自定义样式，可以编辑`styles/globals.css`文件，或者在组件中直接覆盖相关样式。

## 调试

如果遇到问题，请检查：

1. 浏览器控制台是否有错误
2. 环境变量是否正确设置
3. 网络连接是否正常
4. 钱包扩展是否已安装

## 其他资源

- [Solana Web3.js文档](https://solana-labs.github.io/solana-web3.js/)
- [Solana钱包适配器库](https://github.com/solana-labs/wallet-adapter)
- [Solana开发者文档](https://docs.solana.com/) 