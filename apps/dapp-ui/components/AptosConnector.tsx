import React, { useState, useEffect } from 'react';
import Counter from './Counter';
import ErrorDisplay from './ErrorDisplay';

// Aptos模块地址
const APTOS_MODULE_ADDRESS = process.env.NEXT_PUBLIC_APTOS_MODULE_ADDRESS || '';

const AptosConnector: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);

  // 初始化Aptos钱包
  useEffect(() => {
    const initWallet = async () => {
      try {
        // 检查是否有Aptos钱包
        if (typeof window !== 'undefined' && 'aptos' in window) {
          // @ts-ignore
          const wallet = window.aptos;
          setWallet(wallet);
          
          console.log('Aptos钱包已检测到:', wallet);
        } else {
          console.log('未检测到Aptos钱包');
        }
      } catch (err: any) {
        console.error('初始化Aptos钱包失败:', err);
        setError('初始化Aptos钱包失败，请安装Petra钱包扩展');
      }
    };
    
    initWallet();
  }, []);

  // 连接钱包
  const connectWallet = async () => {
    if (!wallet) {
      setError('未检测到Aptos钱包，请安装Petra钱包扩展');
      return;
    }
    
    try {
      setLoading(true);
      // 请求连接钱包
      const response = await wallet.connect();
      console.log('Aptos钱包连接结果:', response);
      
      // 获取账户地址
      const accountAddress = response.address;
      setAccount(accountAddress);
      
      setConnected(true);
      fetchCount();
      setLoading(false);
    } catch (err: any) {
      console.error('连接Aptos钱包失败:', err);
      setError(`连接Aptos钱包失败: ${err.message}`);
      setLoading(false);
    }
  };

  // 获取计数
  const fetchCount = async () => {
    if (!wallet || !connected || !account || !APTOS_MODULE_ADDRESS) return;

    try {
      setLoading(true);
      // 模拟从链上获取数据
      // 在实际应用中，这应该替换为实际的Aptos SDK调用
      console.log('获取Aptos计数...');
      console.log('账户地址:', account);
      console.log('模块地址:', APTOS_MODULE_ADDRESS);
      
      // 模拟数据
      setCount(4);
      
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
      
      // 构建交易参数
      const transaction = {
        type: 'entry_function_payload',
        function: `${APTOS_MODULE_ADDRESS}::counter::increment`,
        arguments: [],
        type_arguments: []
      };
      
      console.log('发送Aptos交易:', transaction);
      
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
      
      // 构建交易参数
      const transaction = {
        type: 'entry_function_payload',
        function: `${APTOS_MODULE_ADDRESS}::counter::decrement`,
        arguments: [],
        type_arguments: []
      };
      
      console.log('发送Aptos交易:', transaction);
      
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
      
      // 构建交易参数
      const transaction = {
        type: 'entry_function_payload',
        function: `${APTOS_MODULE_ADDRESS}::counter::reset`,
        arguments: [],
        type_arguments: []
      };
      
      console.log('发送Aptos交易:', transaction);
      
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
        <h2 className="text-lg font-semibold mb-2">Aptos 钱包</h2>
        {!connected ? (
          <button 
            onClick={connectWallet}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? '连接中...' : '连接Aptos钱包'}
          </button>
        ) : (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
            已连接: {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        )}
      </div>
      
      {/* 模块地址 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">模块地址</h2>
        <p className="text-gray-700 font-mono break-all">{APTOS_MODULE_ADDRESS || '未设置'}</p>
        {!APTOS_MODULE_ADDRESS && (
          <p className="text-yellow-500 mt-1">注意: 请在环境变量中设置 NEXT_PUBLIC_APTOS_MODULE_ADDRESS</p>
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

export default AptosConnector; 