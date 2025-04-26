import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 多链资产信息接口
interface ChainAsset {
  name: string;
  symbol: string;
  balance: string;
  value: number;
  network: string;
  color: string;
}

export default function Dashboard() {
  const [assets, setAssets] = useState<ChainAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 模拟加载多链资产数据
  useEffect(() => {
    // 这里只是模拟数据，实际应用中应该从各个链上获取真实资产数据
    const mockAssets: ChainAsset[] = [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        balance: '0.5',
        value: 1250,
        network: 'Mainnet',
        color: 'bg-blue-500'
      },
      {
        name: 'Solana',
        symbol: 'SOL',
        balance: '10',
        value: 750,
        network: 'Devnet',
        color: 'bg-purple-500'
      },
      {
        name: 'Sui',
        symbol: 'SUI',
        balance: '100',
        value: 150,
        network: 'Devnet',
        color: 'bg-teal-500'
      },
      {
        name: 'Aptos',
        symbol: 'APT',
        balance: '25',
        value: 300,
        network: 'Testnet',
        color: 'bg-red-500'
      },
      {
        name: 'TON',
        symbol: 'TON',
        balance: '5',
        value: 100,
        network: 'Testnet',
        color: 'bg-green-500'
      }
    ];

    // 模拟网络延迟
    setTimeout(() => {
      setAssets(mockAssets);
      setTotalValue(mockAssets.reduce((sum, asset) => sum + asset.value, 0));
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">多链资产总览</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">加载资产数据中...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div>
          {/* 总资产价值卡片 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">总资产价值</h2>
            <p className="text-4xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
            <p className="text-gray-500 mt-2">横跨 5 条区块链</p>
          </div>
          
          {/* 资产分布饼图 - 这里只是一个简单的模拟，实际应用可以使用图表库 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">资产分布</h2>
            <div className="flex h-12 rounded-lg overflow-hidden">
              {assets.map((asset, index) => (
                <div 
                  key={index}
                  className={`${asset.color}`}
                  style={{ width: `${(asset.value / totalValue) * 100}%` }}
                  title={`${asset.name}: $${asset.value.toLocaleString()} (${((asset.value / totalValue) * 100).toFixed(2)}%)`}
                ></div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
              {assets.map((asset, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-3 h-3 ${asset.color} rounded-full mr-2`}></div>
                  <span className="text-sm text-gray-600">{asset.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 资产列表 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    链
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    资产
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    余额
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    价值
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    网络
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full ${asset.color} flex items-center justify-center text-white font-bold`}>
                          {asset.symbol.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.balance}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${asset.value.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {asset.network}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/${asset.name}Test`}>
                        <a className="text-indigo-600 hover:text-indigo-900">查看</a>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 底部导航 */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link href="/">
              <a className="text-blue-500 hover:text-blue-600">
                返回首页
              </a>
            </Link>
            <Link href="/EVMTest">
              <a className="text-blue-500 hover:text-blue-600">
                EVM 测试
              </a>
            </Link>
            <Link href="/SolanaTest">
              <a className="text-blue-500 hover:text-blue-600">
                Solana 测试
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 