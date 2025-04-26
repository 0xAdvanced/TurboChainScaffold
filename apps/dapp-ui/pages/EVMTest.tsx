import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import counterABI from '../contracts/abis/Counter.json';

// 合约地址，部署后需要更新
const COUNTER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_EVM_COUNTER_ADDRESS || '';

export default function EVMTest() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // 初始化 web3 连接
  useEffect(() => {
    const initWeb3 = async () => {
      // 检查浏览器是否支持 ethereum
      if (typeof window.ethereum !== 'undefined') {
        try {
          // 创建 provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);
          
          // 获取链 ID
          const { chainId } = await provider.getNetwork();
          console.log('连接到链 ID:', chainId);
          
          // 创建合约实例
          const contract = new ethers.Contract(
            COUNTER_CONTRACT_ADDRESS,
            counterABI.abi,
            provider
          );
          setContract(contract);
          
          // 加载计数
          await updateCount(contract);
          
          // 监听账户变化
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
            } else {
              setAccount(null);
            }
          });
          
          // 监听链变化
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        } catch (err) {
          console.error('初始化 Web3 失败:', err);
          setError('初始化 Web3 失败，请检查控制台获取详情');
        }
      } else {
        setError('请安装 MetaMask 或其他兼容的钱包');
      }
    };
    
    initWeb3();
    
    // 清理函数
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);
  
  // 连接钱包
  const connectWallet = async () => {
    if (!provider) return;
    
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      
      const signer = provider.getSigner();
      setSigner(signer);
      
      // 使用签名者重新连接合约
      if (contract) {
        const connectedContract = contract.connect(signer);
        setContract(connectedContract);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('连接钱包失败:', err);
      setError('连接钱包失败，请检查控制台获取详情');
      setLoading(false);
    }
  };
  
  // 更新计数显示
  const updateCount = async (contractInstance: ethers.Contract | null = null) => {
    const targetContract = contractInstance || contract;
    if (!targetContract) return;
    
    try {
      const currentCount = await targetContract.count();
      setCount(currentCount.toNumber());
    } catch (err) {
      console.error('获取计数失败:', err);
      setError('获取计数失败，请检查合约地址是否正确');
    }
  };
  
  // 增加计数
  const incrementCount = async () => {
    if (!contract || !signer) {
      setError('请先连接钱包');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.increment();
      await tx.wait();
      await updateCount();
      setLoading(false);
    } catch (err) {
      console.error('增加计数失败:', err);
      setError('增加计数失败，请检查控制台获取详情');
      setLoading(false);
    }
  };
  
  // 减少计数
  const decrementCount = async () => {
    if (!contract || !signer) {
      setError('请先连接钱包');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.decrement();
      await tx.wait();
      await updateCount();
      setLoading(false);
    } catch (err) {
      console.error('减少计数失败:', err);
      setError('减少计数失败，请检查控制台获取详情');
      setLoading(false);
    }
  };
  
  // 重置计数
  const resetCount = async () => {
    if (!contract || !signer) {
      setError('请先连接钱包');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await contract.reset();
      await tx.wait();
      await updateCount();
      setLoading(false);
    } catch (err) {
      console.error('重置计数失败:', err);
      setError('重置计数失败，请检查控制台获取详情');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">EVM 测试</h1>
      
      {/* 钱包连接 */}
      <div className="mb-6">
        {!account ? (
          <button 
            onClick={connectWallet}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? '连接中...' : '连接钱包'}
          </button>
        ) : (
          <div>
            <p className="text-gray-700">已连接: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
          </div>
        )}
      </div>
      
      {/* 合约地址 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">合约地址</h2>
        <p className="text-gray-700">{COUNTER_CONTRACT_ADDRESS || '未设置'}</p>
      </div>
      
      {/* 计数显示 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">当前计数</h2>
        {count !== null ? (
          <p className="text-4xl font-bold">{count}</p>
        ) : (
          <p className="text-gray-500">未连接或加载失败</p>
        )}
      </div>
      
      {/* 操作按钮 */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={incrementCount}
          disabled={loading || !account}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          增加 (+1)
        </button>
        <button 
          onClick={decrementCount}
          disabled={loading || !account || count === 0}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          减少 (-1)
        </button>
        <button 
          onClick={resetCount}
          disabled={loading || !account}
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