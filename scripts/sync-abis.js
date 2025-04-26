#!/usr/bin/env node

/**
 * 同步各链合约ABI/IDL到前端
 * 使用方法: node scripts/sync-abis.js <chain>
 * 示例: node scripts/sync-abis.js evm
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const chain = process.argv[2];

if (!chain) {
  console.error('❌ 请指定链: evm, solana, sui, aptos, ton');
  process.exit(1);
}

// 目标前端ABI目录
const targetDir = path.join(__dirname, '../apps/dapp-ui/contracts/abis');

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`📁 创建目录: ${targetDir}`);
}

// 同步EVM链ABI
function syncEVMABIs() {
  const evmArtifactsDir = path.join(__dirname, '../chains/evm/artifacts/contracts');
  
  if (!fs.existsSync(evmArtifactsDir)) {
    console.error('❌ EVM合约编译后的artifacts目录不存在，请先编译合约');
    process.exit(1);
  }

  // 遍历artifacts目录查找所有合约ABI
  const processDirectory = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
      const fullPath = path.join(dir, dirent.name);
      
      if (dirent.isDirectory()) {
        processDirectory(fullPath);
      } else if (dirent.name.endsWith('.json') && !dirent.name.endsWith('.dbg.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const artifact = JSON.parse(content);
          
          // 提取合约名称和ABI
          if (artifact.abi && artifact.contractName) {
            const contractName = artifact.contractName || path.basename(dirent.name, '.json');
            const targetFile = path.join(targetDir, `${contractName}.json`);
            
            // 只保存ABI部分
            const abiContent = {
              abi: artifact.abi,
              bytecode: artifact.bytecode
            };
            
            fs.writeFileSync(targetFile, JSON.stringify(abiContent, null, 2));
            console.log(`✅ 已同步 EVM 合约 ABI: ${contractName}`);
          }
        } catch (err) {
          console.error(`❌ 处理文件失败 ${fullPath}:`, err);
        }
      }
    });
  };

  // 查找特定位置的Contract.json文件
  const findContractJson = () => {
    const contractPaths = [
      path.join(__dirname, '../chains/evm/artifacts/contracts/Counter.sol/Counter.json')
    ];

    contractPaths.forEach(contractPath => {
      if (fs.existsSync(contractPath)) {
        try {
          const content = fs.readFileSync(contractPath, 'utf8');
          const artifact = JSON.parse(content);
          
          // 提取合约名称和ABI
          if (artifact.abi) {
            const contractName = path.basename(contractPath, '.json');
            const targetFile = path.join(targetDir, `${contractName}.json`);
            
            // 只保存ABI部分
            const abiContent = {
              abi: artifact.abi,
              bytecode: artifact.bytecode
            };
            
            fs.writeFileSync(targetFile, JSON.stringify(abiContent, null, 2));
            console.log(`✅ 已同步 EVM 合约 ABI: ${contractName}`);
          }
        } catch (err) {
          console.error(`❌ 处理文件失败 ${contractPath}:`, err);
        }
      }
    });
  };

  // 优先尝试特定路径，再尝试遍历目录
  findContractJson();
  processDirectory(evmArtifactsDir);
}

// 同步Solana链IDL
function syncSolanaIDLs() {
  const solanaTargetDir = path.join(targetDir, 'solana');
  if (!fs.existsSync(solanaTargetDir)) {
    fs.mkdirSync(solanaTargetDir, { recursive: true });
  }
  
  const idlPath = path.join(__dirname, '../chains/solana/target/idl');
  
  if (!fs.existsSync(idlPath)) {
    console.warn('⚠️ Solana IDL目录不存在，可能未编译合约');
    return;
  }
  
  fs.readdirSync(idlPath).forEach(file => {
    if (file.endsWith('.json')) {
      const sourceFile = path.join(idlPath, file);
      const targetFile = path.join(solanaTargetDir, file);
      
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`✅ 已同步 Solana IDL: ${file}`);
    }
  });
}

// 同步Sui链Move ABI
function syncSuiABIs() {
  const suiTargetDir = path.join(targetDir, 'sui');
  if (!fs.existsSync(suiTargetDir)) {
    fs.mkdirSync(suiTargetDir, { recursive: true });
  }
  
  const buildPath = path.join(__dirname, '../chains/sui/build');
  
  if (!fs.existsSync(buildPath)) {
    console.warn('⚠️ Sui build目录不存在，可能未编译合约');
    return;
  }
  
  // 遍历build目录查找模块JSON
  const processDirectory = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
      const fullPath = path.join(dir, dirent.name);
      
      if (dirent.isDirectory()) {
        processDirectory(fullPath);
      } else if (dirent.name.endsWith('.json')) {
        const targetFile = path.join(suiTargetDir, dirent.name);
        fs.copyFileSync(fullPath, targetFile);
        console.log(`✅ 已同步 Sui ABI: ${dirent.name}`);
      }
    });
  };
  
  processDirectory(buildPath);
}

// 同步Aptos链Move ABI
function syncAptosABIs() {
  const aptosTargetDir = path.join(targetDir, 'aptos');
  if (!fs.existsSync(aptosTargetDir)) {
    fs.mkdirSync(aptosTargetDir, { recursive: true });
  }
  
  const buildPath = path.join(__dirname, '../chains/aptos/build');
  
  if (!fs.existsSync(buildPath)) {
    console.warn('⚠️ Aptos build目录不存在，可能未编译合约');
    return;
  }
  
  // 遍历找出所有ABI JSON文件
  const processDirectory = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
      const fullPath = path.join(dir, dirent.name);
      
      if (dirent.isDirectory()) {
        processDirectory(fullPath);
      } else if (dirent.name.endsWith('.abi.json')) {
        const targetFile = path.join(aptosTargetDir, dirent.name);
        fs.copyFileSync(fullPath, targetFile);
        console.log(`✅ 已同步 Aptos ABI: ${dirent.name}`);
      }
    });
  };
  
  processDirectory(buildPath);
}

// 同步TON链ABI
function syncTONABIs() {
  const tonTargetDir = path.join(targetDir, 'ton');
  if (!fs.existsSync(tonTargetDir)) {
    fs.mkdirSync(tonTargetDir, { recursive: true });
  }
  
  const abiPath = path.join(__dirname, '../chains/ton/build');
  
  if (!fs.existsSync(abiPath)) {
    console.warn('⚠️ TON build目录不存在，可能未编译合约');
    return;
  }
  
  fs.readdirSync(abiPath).forEach(file => {
    if (file.endsWith('.abi.json')) {
      const sourceFile = path.join(abiPath, file);
      const targetFile = path.join(tonTargetDir, file);
      
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`✅ 已同步 TON ABI: ${file}`);
    }
  });
}

// 根据指定的链执行同步
switch (chain.toLowerCase()) {
  case 'evm':
    syncEVMABIs();
    break;
  case 'solana':
    syncSolanaIDLs();
    break;
  case 'sui':
    syncSuiABIs();
    break;
  case 'aptos':
    syncAptosABIs();
    break;
  case 'ton':
    syncTONABIs();
    break;
  case 'all':
    syncEVMABIs();
    syncSolanaIDLs();
    syncSuiABIs();
    syncAptosABIs();
    syncTONABIs();
    break;
  default:
    console.error(`❌ 不支持的链: ${chain}`);
    process.exit(1);
}

console.log('🎉 ABI/IDL同步完成!'); 