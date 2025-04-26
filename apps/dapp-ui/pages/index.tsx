import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 链信息数据
const chainData = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    description: '以太坊虚拟机生态系统，包括 Ethereum、Polygon、BSC 等。',
    color: 'bg-blue-500',
    testnet: 'Sepolia',
    contractName: 'Counter Contract',
    contractAddress: '0x2Ad8be6606413803966050609aebB35a00259191',
    pagePath: '/EVMTest',
    features: ['ERC-20', 'ERC-721', 'ERC-1155', '智能合约'],
    icon: '🔷'
  },
  {
    id: 'solana',
    name: 'Solana',
    description: '高性能区块链平台，使用 Rust 和 Anchor 框架开发。',
    color: 'bg-purple-500',
    testnet: 'Devnet',
    contractName: 'Counter Program',
    contractAddress: '尚未部署',
    pagePath: '/SolanaTest',
    features: ['SPL Token', 'Metaplex NFT', '高 TPS', '低交易费'],
    icon: '☀️'
  },
  {
    id: 'sui',
    name: 'Sui',
    description: '由 Mysten Labs 开发的高性能区块链，使用 Move 语言。',
    color: 'bg-teal-500',
    testnet: 'Devnet',
    contractName: 'Counter Module',
    contractAddress: '尚未部署',
    pagePath: '/SuiTest',
    features: ['Move 语言', '对象模型', '并行执行', '低延迟'],
    icon: '🌊'
  },
  {
    id: 'aptos',
    name: 'Aptos',
    description: '由前 Diem 团队打造的 Layer 1 区块链，使用 Move 语言。',
    color: 'bg-red-500',
    testnet: 'Testnet',
    contractName: 'Counter Module',
    contractAddress: '尚未部署',
    pagePath: '/AptosTest',
    features: ['Move 语言', 'BFT 共识', '高吞吐量', '安全资产管理'],
    icon: '🔺'
  },
  {
    id: 'ton',
    name: 'TON',
    description: '由 Telegram 创始人开发的高性能区块链，使用 Tact 语言。',
    color: 'bg-green-500',
    testnet: 'Testnet',
    contractName: 'Counter Contract',
    contractAddress: '尚未部署',
    pagePath: '/TonTest',
    features: ['FunC/Tact 语言', '分片', 'TON 钱包集成', '自修复机制'],
    icon: '💎'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部横幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">TurboChainScaffold</h1>
          <p className="text-xl md:text-2xl mb-6">多链智能合约与前端一体化开发脚手架</p>
          <div className="flex justify-center space-x-2 mb-4">
            {chainData.map((chain) => (
              <span 
                key={chain.id}
                className={`inline-block ${chain.color} text-white text-2xl px-2 py-1 rounded-full`}
              >
                {chain.icon}
              </span>
            ))}
          </div>
          <p className="max-w-2xl mx-auto text-gray-100">
            一站式支持 EVM、Solana、Sui、Aptos 和 TON 的开发环境，从合约开发到前端交互全流程覆盖。
          </p>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-12">
        {/* 已部署状态 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4">部署状态</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">链</th>
                  <th className="px-4 py-2">测试网</th>
                  <th className="px-4 py-2">合约名称</th>
                  <th className="px-4 py-2">合约地址</th>
                  <th className="px-4 py-2">状态</th>
                </tr>
              </thead>
              <tbody>
                {chainData.map((chain) => (
                  <tr key={chain.id} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className={`mr-2 ${chain.color} text-white rounded-full h-8 w-8 flex items-center justify-center`}>
                          {chain.icon}
                        </span>
                        {chain.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">{chain.testnet}</td>
                    <td className="px-4 py-3">{chain.contractName}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">
                        {chain.id === 'ethereum' ? (
                          <a 
                            href={`https://sepolia.etherscan.io/address/${chain.contractAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 truncate block max-w-xs"
                          >
                            {chain.contractAddress}
                          </a>
                        ) : (
                          chain.contractAddress
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {chain.id === 'ethereum' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          已部署
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          未部署
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 链卡片展示 */}
        <h2 className="text-2xl font-bold mb-6">支持的区块链</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {chainData.map((chain) => (
            <div key={chain.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className={`${chain.color} text-white py-4 px-5`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{chain.name}</h2>
                  <span className="text-2xl">{chain.icon}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 mb-4">
                  {chain.description}
                </p>
                <div className="mb-4">
                  <p className="font-medium text-gray-700 mb-2">主要特点：</p>
                  <div className="flex flex-wrap gap-2">
                    {chain.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <Link 
                  href={chain.pagePath}
                  className={`block text-center ${chain.color} hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded transition-colors duration-200`}
                >
                  查看 {chain.name} 测试
                </Link>
              </div>
            </div>
          ))}

          {/* Dashboard 卡片 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-gray-800 text-white py-4 px-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Dashboard</h2>
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-600 mb-4">
                多链资产总览，监控各个链上的资产和状态。实时查看多链部署情况。
              </p>
              <div className="mb-4">
                <p className="font-medium text-gray-700 mb-2">功能：</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">资产监控</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">多链管理</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">数据统计</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">状态追踪</span>
                </div>
              </div>
              <Link 
                href="/dashboard"
                className="block text-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                查看 Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* 项目特点 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">项目特点</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold">TurboRepo Monorepo 架构</p>
              <p className="text-gray-600">构建极速，模块化管理，开发效率提升</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-semibold">多链智能合约统一管理</p>
              <p className="text-gray-600">五大主流链一站式开发与部署</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="font-semibold">多链多钱包支持</p>
              <p className="text-gray-600">MetaMask, Phantom, Sui Wallet 等全覆盖</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <p className="font-semibold">合约 ABI/IDL 自动同步</p>
              <p className="text-gray-600">前后端无缝衔接，降低开发复杂度</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <p className="font-semibold">一键部署与测试</p>
              <p className="text-gray-600">简化开发流程，提高开发效率</p>
            </div>
            <div className="border-l-4 border-teal-500 pl-4 py-2">
              <p className="font-semibold">Faucet 测试币一键领取</p>
              <p className="text-gray-600">测试环境快速配置，无缝切换</p>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">TurboChainScaffold © 2024 - 多链开发脚手架</p>
          <p className="text-gray-400 text-sm">
            基于 TurboRepo、Hardhat、Anchor、Move 和 Next.js 构建
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              GitHub
            </a>
            <a href="https://docs.turborepo.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              TurboRepo
            </a>
            <a href="https://hardhat.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              Hardhat
            </a>
            <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              Next.js
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}