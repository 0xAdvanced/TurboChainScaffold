import React, { useState, useEffect } from 'react';
import Counter from './Counter';
import ErrorDisplay from './ErrorDisplay';

// TON合约地址
const TON_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TON_CONTRACT_ADDRESS || '';

const TONConnector: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);

  // 初始化TON钱包
  useEffect(() => {
    const initWallet = async () => {
      try {
        // 检查是否有TON钱包
        if (typeof window !== 'undefined' && 'ton' in window) {
          // @ts-ignore
          const provider = window.ton;
          setWallet(provider);
          
          console.log('TON钱包已检测到:', provider);
        } else {
          console.log('未检测到TON钱包');
        }
      } catch (err: any) {
        console.error('初始化TON钱包失败:', err);
        setError('初始化TON钱包失败，请安装TON钱包扩展');
      }
    };
    
    initWallet();
  }, []);

  // 连接钱包
  const connectWallet = async () => {
    if (!wallet) {
      setError('未检测到TON钱包，请安装TON钱包扩展');
      return;
    }
    
    try {
      setLoading(true);
      // 请求连接钱包
      const result = await wallet.connect();
      console.log('TON钱包连接结果:', result);
      
      if (result) {
        // 获取账户地址
        const walletAddress = await wallet.send('ton_requestAccounts');
        if (walletAddress && walletAddress.length > 0) {
          setAccount(walletAddress[0]);
          setConnected(true);
          fetchCount();
        }
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('连接TON钱包失败:', err);
      setError(`连接TON钱包失败: ${err.message}`);
      setLoading(false);
    }
  };

  // 获取计数
  const fetchCount = async () => {
    if (!wallet || !connected || !account || !TON_CONTRACT_ADDRESS) return;

    try {
      setLoading(true);
      // 模拟从链上获取数据
      // 在实际应用中，这应该替换为实际的TON SDK调用
      console.log('获取TON计数...');
      console.log('账户地址:', account);
      console.log('合约地址:', TON_CONTRACT_ADDRESS);
      
      // 模拟数据
      setCount(7);
      
      setLoading(false);
    } catch (err: any) {
      console.error('读取计数失败:', err);
      setError(`读取计数失败: ${err.message}`);
      setLoading(false);
    }
  };

  // 增加计数
  const increment = async () => {
    if (!wallet || !connected || !account) return;
    
    try {
      setLoading(true);
      
      console.log('发送TON交易: increment');
      
      // 模拟成功响应
      setCount(prev => prev !== null ? prev + 1 : 1);
      
      setLoading(false);
    } catch (err: any) {
      console.error('增加计数失败:', err);
      setError(`增加计数失败: ${err.message}`);
      setLoading(false);
    }
  };

  // 减少计数
  const decrement = async () => {
    if (!wallet || !connected || !account) return;
    
    try {
      setLoading(true);
      
      console.log('发送TON交易: decrement');
      
      // 模拟成功响应
      setCount(prev => prev !== null && prev > 0 ? prev - 1 : 0);
      
      setLoading(false);
    } catch (err: any) {
      console.error('减少计数失败:', err);
      setError(`减少计数失败: ${err.message}`);
      setLoading(false);
    }
  };

  // 重置计数
  const reset = async () => {
    if (!wallet || !connected || !account) return;
    
    try {
      setLoading(true);
      
      console.log('发送TON交易: reset');
      
      // 模拟成功响应
      setCount(0);
      
      setLoading(false);
    } catch (err: any) {
      console.error('重置计数失败:', err);
      setError(`重置计数失败: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 错误显示 */}
      <ErrorDisplay error={error} onClose={() => setError(null)} />
      
      {/* 钱包连接 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">TON 钱包</h2>
        {!connected ? (
          <button 
            onClick={connectWallet}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? '连接中...' : '连接TON钱包'}
          </button>
        ) : (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
            已连接: {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        )}
      </div>
      
      {/* 合约地址 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">合约地址</h2>
        <p className="text-gray-700 font-mono break-all">{TON_CONTRACT_ADDRESS || '未设置'}</p>
        {!TON_CONTRACT_ADDRESS && (
          <p className="text-yellow-500 mt-1">注意: 请在环境变量中设置 NEXT_PUBLIC_TON_CONTRACT_ADDRESS</p>
        )}
      </div>
      
      {/* 计数器组件 */}
      <Counter
        count={count}
        isLoading={loading}
        isConnected={connected}
        onIncrement={increment}
        onDecrement={decrement}
        onReset={reset}
        isZero={count !== null && count === 0}
      />
    </div>
  );
};

export default TONConnector; 