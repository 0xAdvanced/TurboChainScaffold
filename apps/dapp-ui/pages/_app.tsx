import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { WagmiConfig, createConfig, configureChains, mainnet, goerli, sepolia } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// 配置链
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, goerli, sepolia],
  [publicProvider()]
);

// 配置钱包连接器
const { connectors } = getDefaultWallets({
  appName: 'TurboChainScaffold',
  projectId: 'YOUR_PROJECT_ID', // 需要替换为真实 WalletConnect 项目 ID
  chains
});

// 创建 wagmi 配置
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp; 