import React from 'react';

export enum ChainType {
  EVM = 'evm',
  SOLANA = 'solana',
  SUI = 'sui',
  APTOS = 'aptos',
  TON = 'ton'
}

type ChainSelectorProps = {
  currentChain: ChainType;
  onChainChange: (chain: ChainType) => void;
};

const ChainSelector: React.FC<ChainSelectorProps> = ({ currentChain, onChainChange }) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">选择区块链</h2>
      <div className="flex flex-wrap gap-2">
        <ChainButton 
          chain={ChainType.EVM} 
          currentChain={currentChain} 
          onClick={() => onChainChange(ChainType.EVM)}
          label="以太坊" 
        />
        <ChainButton 
          chain={ChainType.SOLANA} 
          currentChain={currentChain} 
          onClick={() => onChainChange(ChainType.SOLANA)}
          label="Solana" 
        />
        <ChainButton 
          chain={ChainType.SUI} 
          currentChain={currentChain} 
          onClick={() => onChainChange(ChainType.SUI)}
          label="Sui" 
        />
        <ChainButton 
          chain={ChainType.APTOS} 
          currentChain={currentChain} 
          onClick={() => onChainChange(ChainType.APTOS)}
          label="Aptos" 
        />
        <ChainButton 
          chain={ChainType.TON} 
          currentChain={currentChain} 
          onClick={() => onChainChange(ChainType.TON)}
          label="TON" 
        />
      </div>
    </div>
  );
};

interface ChainButtonProps {
  chain: ChainType;
  currentChain: ChainType;
  onClick: () => void;
  label: string;
}

const ChainButton: React.FC<ChainButtonProps> = ({ chain, currentChain, onClick, label }) => {
  const isActive = chain === currentChain;
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
      }`}
    >
      {label}
    </button>
  );
};

export default ChainSelector; 