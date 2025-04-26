import React, { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import counterABI from '../contracts/abis/Counter.json';
import { useAccount, useNetwork, usePublicClient, useWalletClient, configureChains, createConfig, WagmiConfig } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

// 合约地址，部署后需要更新
const COUNTER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_EVM_COUNTER_ADDRESS || '';

// RPC URL
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_EVM_SEPOLIA_RPC_URL || '';

// 调试用
console.log('合约地址:', COUNTER_CONTRACT_ADDRESS);
console.log('Sepolia RPC URL:', SEPOLIA_RPC_URL);

export default function EVMTest() {
  const [count, setCount] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Wagmi 钩子
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({
    chainId: sepolia.id
  });
  
  // 读取合约状态
  const { data: countData, refetch: refetchCount } = useContractRead({
    address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
    abi: counterABI.abi,
    functionName: 'count',
    chainId: sepolia.id,
    watch: true,
    onSuccess(data) {
      console.log('成功读取到计数:', data);
      setCount(data as bigint);
    },
    onError(err) {
      console.error('读取计数失败:', err);
      setError(`读取计数失败: ${err.message}`);
    },
  });
  
  // 准备写入操作 - 增加计数
  const { config: incrementConfig } = usePrepareContractWrite({
    address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
    abi: counterABI.abi,
    functionName: 'increment',
    chainId: sepolia.id,
    enabled: isConnected,
  });
  
  // 执行写入操作 - 增加计数
  const { write: increment, isLoading: isIncrementing } = useContractWrite({
    ...incrementConfig,
    onSuccess() {
      refetchCount();
    },
    onError(err) {
      console.error('增加计数失败:', err);
      setError(`增加计数失败: ${err.message}`);
    },
  });
  
  // 准备写入操作 - 减少计数
  const { config: decrementConfig } = usePrepareContractWrite({
    address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
    abi: counterABI.abi,
    functionName: 'decrement',
    chainId: sepolia.id,
    enabled: isConnected && count !== null && count > BigInt(0),
  });
  
  // 执行写入操作 - 减少计数
  const { write: decrement, isLoading: isDecrementing } = useContractWrite({
    ...decrementConfig,
    onSuccess() {
      refetchCount();
    },
    onError(err) {
      console.error('减少计数失败:', err);
      setError(`减少计数失败: ${err.message}`);
    },
  });
  
  // 准备写入操作 - 重置计数
  const { config: resetConfig } = usePrepareContractWrite({
    address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
    abi: counterABI.abi,
    functionName: 'reset',
    chainId: sepolia.id,
    enabled: isConnected,
  });
  
  // 执行写入操作 - 重置计数
  const { write: reset, isLoading: isResetting } = useContractWrite({
    ...resetConfig,
    onSuccess() {
      refetchCount();
    },
    onError(err) {
      console.error('重置计数失败:', err);
      setError(`重置计数失败: ${err.message}`);
    },
  });
  
  // 更新加载状态
  useEffect(() => {
    setLoading(isIncrementing || isDecrementing || isResetting);
  }, [isIncrementing, isDecrementing, isResetting]);
  
  // 检查当前链是否正确
  const isWrongNetwork = chain && chain.id !== sepolia.id;

  // 尝试直接使用ethers.js读取计数（备用方案）
  const readCountWithEthers = async () => {
    try {
      setLoading(true);
      // 使用自定义RPC URL创建provider
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      
      // 创建只读合约实例
      const contract = new ethers.Contract(
        COUNTER_CONTRACT_ADDRESS,
        counterABI.abi,
        provider
      );
      
      // 调用count方法
      console.log('使用ethers.js直接调用count()...');
      const result = await contract.count();
      console.log('ethers.js读取结果:', result);
      
      setCount(result);
      setError(null);
      setLoading(false);
    } catch (err: any) {
      console.error('ethers.js读取失败:', err);
      setError(`ethers.js读取失败: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">EVM 测试</h1>
      
      {/* 钱包连接 */}
      <div className="mb-6">
        <ConnectButton />
        {isWrongNetwork && (
          <p className="text-red-500 mt-2">请切换到 Sepolia 测试网</p>
        )}
      </div>
      
      {/* 合约地址 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">合约地址</h2>
        <p className="text-gray-700">{COUNTER_CONTRACT_ADDRESS || '未设置'}</p>
        <p className="text-gray-500 text-sm">RPC URL: {SEPOLIA_RPC_URL ? `${SEPOLIA_RPC_URL.substring(0, 25)}...` : '未设置'}</p>
      </div>
      
      {/* 计数显示 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">当前计数</h2>
        {count !== null ? (
          <p className="text-4xl font-bold">{count.toString()}</p>
        ) : (
          <p className="text-gray-500">未连接或加载失败</p>
        )}
        <button
          onClick={readCountWithEthers}
          disabled={loading}
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
        >
          {loading ? '读取中...' : '使用ethers.js读取计数'}
        </button>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => increment?.()}
          disabled={loading || !isConnected || !increment || isWrongNetwork}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          增加 (+1)
        </button>
        <button 
          onClick={() => decrement?.()}
          disabled={loading || !isConnected || !decrement || (count !== null && count === BigInt(0)) || isWrongNetwork}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          减少 (-1)
        </button>
        <button 
          onClick={() => reset?.()}
          disabled={loading || !isConnected || !reset || isWrongNetwork}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          重置
        </button>
      </div>
      
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">关闭</span>
            <span>&times;</span>
          </button>
        </div>
      )}
      
      {/* 加载提示 */}
      {loading && (
        <div className="text-center">
          <p className="text-gray-500">处理中...</p>
        </div>
      )}
    </div>
  );
} 