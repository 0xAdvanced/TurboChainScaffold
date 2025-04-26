import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey } from '@solana/web3.js';
import styles from "../styles/Home.module.css";

// 使用@solana/wallet-adapter-react-ui的样式
import '@solana/wallet-adapter-react-ui/styles.css';

// Solana RPC URL
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// 对于Anchor程序，该地址应来自环境变量
const COUNTER_PROGRAM_ID = process.env.NEXT_PUBLIC_SOLANA_COUNTER_ADDRESS || '';

const SolanaConnector: React.FC = () => {
  const { publicKey, signTransaction, connected, connect, disconnect } = useWallet();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);

  // 初始化连接
  useEffect(() => {
    const conn = new Connection(SOLANA_RPC_URL);
    setConnection(conn);
  }, []);

  // 当钱包连接状态改变时获取计数
  useEffect(() => {
    if (connected && publicKey) {
      fetchCount();
    } else {
      setCount(null);
    }
  }, [connected, publicKey]);

  // 获取计数
  const fetchCount = async () => {
    if (!connected || !publicKey) {
      return;
    }

    try {
      setLoading(true);
      // 在实际应用中，这里应该调用Solana合约来获取数据
      // 出于演示目的，我们使用模拟数据
      console.log("从Solana链获取计数");
      setTimeout(() => {
        setCount(10);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("获取计数时出错:", error);
      setError("获取计数时出错");
      setLoading(false);
    }
  };

  // 增加计数
  const incrementCount = async () => {
    if (!connected || !publicKey) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 这里模拟与Solana合约交互
      console.log("发送交易到Solana链");
      console.log("交易数据: 增加计数");
      
      // 模拟交易延迟
      setTimeout(() => {
        setCount(prev => prev !== null ? prev + 1 : 1);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("增加计数时出错:", error);
      setError("增加计数时出错");
      setLoading(false);
    }
  };

  // 减少计数
  const decrementCount = async () => {
    if (!connected || !publicKey) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 这里模拟与Solana合约交互
      console.log("发送交易到Solana链");
      console.log("交易数据: 减少计数");
      
      // 模拟交易延迟
      setTimeout(() => {
        setCount(prev => prev !== null && prev > 0 ? prev - 1 : 0);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("减少计数时出错:", error);
      setError("减少计数时出错");
      setLoading(false);
    }
  };

  // 重置计数
  const resetCount = async () => {
    if (!connected || !publicKey) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 这里模拟与Solana合约交互
      console.log("发送交易到Solana链");
      console.log("交易数据: 重置计数");
      
      // 模拟交易延迟
      setTimeout(() => {
        setCount(0);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("重置计数时出错:", error);
      setError("重置计数时出错");
      setLoading(false);
    }
  };

  // 处理连接钱包
  const handleConnectWallet = async () => {
    try {
      setError(null);
      await connect();
    } catch (error) {
      console.error("连接钱包时出错:", error);
      setError("连接钱包时出错");
    }
  };

  // 处理断开钱包连接
  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("断开钱包连接时出错:", error);
      setError("断开钱包连接时出错");
    }
  };

  return (
    <div className={styles.card}>
      <h2>Solana连接</h2>
      
      {error && <p className={styles.error}>{error}</p>}
      
      {!connected ? (
        <div className={styles.walletButtons}>
          <WalletMultiButton className={styles.walletButton} />
          <button 
            onClick={handleConnectWallet} 
            disabled={loading}
            className={styles.button}
          >
            {loading ? "连接中..." : "连接Solana钱包"}
          </button>
        </div>
      ) : (
        <div>
          <p className={styles.account}>
            已连接账户: {publicKey ? `${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}` : "未知"}
          </p>
          <div className={styles.walletButtons}>
            <WalletMultiButton className={styles.walletButton} />
            <button 
              onClick={handleDisconnectWallet} 
              className={styles.button}
              disabled={loading}
            >
              断开连接
            </button>
          </div>
          
          <div className={styles.counterSection}>
            <h3>计数器: {count !== null ? count : "未加载"}</h3>
            <div className={styles.counterButtons}>
              <button 
                onClick={incrementCount} 
                disabled={loading || !connected}
                className={styles.button}
              >
                增加
              </button>
              <button 
                onClick={decrementCount} 
                disabled={loading || !connected || count === 0}
                className={styles.button}
              >
                减少
              </button>
              <button 
                onClick={resetCount} 
                disabled={loading || !connected || count === 0}
                className={styles.button}
              >
                重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolanaConnector; 