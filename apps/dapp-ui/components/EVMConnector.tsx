import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import counterABI from '../contracts/abis/Counter.json';
import Counter from './Counter';
import ErrorDisplay from './ErrorDisplay';

// 合约地址
const COUNTER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_EVM_COUNTER_ADDRESS || '';

const EVMConnector: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [count, setCount] = React.useState<bigint | null>(null);
  
  // Wagmi 钩子
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  
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
  React.useEffect(() => {
    setLoading(isIncrementing || isDecrementing || isResetting);
  }, [isIncrementing, isDecrementing, isResetting]);
  
  // 检查当前链是否正确
  const isWrongNetwork = chain && chain.id !== sepolia.id;

  return (
    <div>
      {/* 错误显示 */}
      <ErrorDisplay error={error} onClose={() => setError(null)} />
      
      {/* 钱包连接 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">连接钱包</h2>
        <ConnectButton />
        {isWrongNetwork && (
          <p className="text-red-500 mt-2">请切换到 Sepolia 测试网</p>
        )}
      </div>
      
      {/* 合约地址 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">合约地址</h2>
        <p className="text-gray-700 font-mono break-all">{COUNTER_CONTRACT_ADDRESS || '未设置'}</p>
      </div>
      
      {/* 计数器组件 */}
      <Counter
        count={count}
        isLoading={loading}
        isConnected={isConnected}
        isWrongNetwork={isWrongNetwork}
        onIncrement={() => increment?.()}
        onDecrement={() => decrement?.()}
        onReset={() => reset?.()}
        isZero={count !== null && count === BigInt(0)}
      />
    </div>
  );
};

export default EVMConnector; 