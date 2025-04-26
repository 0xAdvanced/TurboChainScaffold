import React from 'react';

interface CounterProps {
  count: bigint | number | null;
  isLoading: boolean;
  isConnected: boolean;
  isWrongNetwork?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  isZero: boolean;
}

const Counter: React.FC<CounterProps> = ({
  count,
  isLoading,
  isConnected,
  isWrongNetwork = false,
  onIncrement,
  onDecrement,
  onReset,
  isZero
}) => {
  return (
    <div>
      {/* 计数显示 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">当前计数</h2>
        {count !== null ? (
          <p className="text-4xl font-bold">{count.toString()}</p>
        ) : (
          <p className="text-gray-500">未连接或加载失败</p>
        )}
      </div>
      
      {/* 操作按钮 */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={onIncrement}
          disabled={isLoading || !isConnected || isWrongNetwork}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          增加 (+1)
        </button>
        <button 
          onClick={onDecrement}
          disabled={isLoading || !isConnected || isZero || isWrongNetwork}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          减少 (-1)
        </button>
        <button 
          onClick={onReset}
          disabled={isLoading || !isConnected || isWrongNetwork}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          重置
        </button>
      </div>
      
      {/* 加载提示 */}
      {isLoading && (
        <div className="text-center">
          <p className="text-gray-500">处理中...</p>
        </div>
      )}
    </div>
  );
};

export default Counter; 