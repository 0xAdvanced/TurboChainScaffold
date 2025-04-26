import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">TurboChainScaffold</h1>
      <p className="text-lg text-center mb-8">多链智能合约与前端一体化开发脚手架</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* EVM 卡片 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-500 text-white py-3 px-4">
            <h2 className="text-xl font-semibold">EVM</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              以太坊虚拟机生态系统，包括 Ethereum、Polygon、BSC 等。
            </p>
            <Link href="/EVMTest">
              <a className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                查看 EVM 测试
              </a>
            </Link>
          </div>
        </div>
        
        {/* Solana 卡片 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-500 text-white py-3 px-4">
            <h2 className="text-xl font-semibold">Solana</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              高性能区块链平台，使用 Rust 和 Anchor 框架开发。
            </p>
            <Link href="/SolanaTest">
              <a className="block text-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
                查看 Solana 测试
              </a>
            </Link>
          </div>
        </div>
        
        {/* Sui 卡片 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-teal-500 text-white py-3 px-4">
            <h2 className="text-xl font-semibold">Sui</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              由 Mysten Labs 开发的高性能区块链，使用 Move 语言。
            </p>
            <Link href="/SuiTest">
              <a className="block text-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded">
                查看 Sui 测试
              </a>
            </Link>
          </div>
        </div>
        
        {/* Aptos 卡片 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-red-500 text-white py-3 px-4">
            <h2 className="text-xl font-semibold">Aptos</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              由前 Diem 团队打造的 Layer 1 区块链，使用 Move 语言。
            </p>
            <Link href="/AptosTest">
              <a className="block text-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                查看 Aptos 测试
              </a>
            </Link>
          </div>
        </div>
        
        {/* TON 卡片 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-500 text-white py-3 px-4">
            <h2 className="text-xl font-semibold">TON</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              由 Telegram 创始人开发的高性能区块链，使用 Tact 语言。
            </p>
            <Link href="/TonTest">
              <a className="block text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                查看 TON 测试
              </a>
            </Link>
          </div>
        </div>
        
        {/* 总览页 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-800 text-white py-3 px-4">
            <h2 className="text-xl font-semibold">Dashboard</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              多链资产总览，监控各个链上的资产和状态。
            </p>
            <Link href="/dashboard">
              <a className="block text-center bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded">
                查看 Dashboard
              </a>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">项目特点</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>支持多链开发：EVM、Solana、Sui、Aptos、TON</li>
          <li>TurboRepo Monorepo 架构，构建速度快</li>
          <li>多链智能合约统一管理</li>
          <li>多链多钩绑支持</li>
          <li>合约 ABI/IDL 自动同步至前端</li>
          <li>一键部署功能</li>
          <li>Faucet 测试币一键领取</li>
          <li>多链资产总览页</li>
        </ul>
      </div>
      
      <footer className="text-center text-gray-500 mt-12">
        <p>TurboChainScaffold © 2024 - 多链开发脚手架</p>
      </footer>
    </div>
  );
}