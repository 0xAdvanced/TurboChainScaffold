// 用于快速生成新链子项目模版，比如一键建个新 EVM/TON/Sui 工程
// scaffold.ts

import fs from 'fs';
import path from 'path';

const [,, chainName] = process.argv;

if (!chainName) {
  console.error("❌ 请指定要创建的新链模块名称，例如: npm run scaffold mychain");
  process.exit(1);
}

const chainsRoot = path.resolve(__dirname, '../chains');
const newChainPath = path.join(chainsRoot, chainName);

if (fs.existsSync(newChainPath)) {
  console.error("❌ 指定的链子项目已存在!");
  process.exit(1);
}

// 创建目录结构
fs.mkdirSync(newChainPath, { recursive: true });

// 创建基础文件
const sampleContract = `
// ${chainName} Smart Contract Placeholder

// 请根据实际链技术栈编写智能合约内容
`;

fs.writeFileSync(path.join(newChainPath, 'README.md'), `# ${chainName} Contracts\n\nSmart contracts for ${chainName} blockchain.`);
fs.writeFileSync(path.join(newChainPath, `${chainName}.contract`), sampleContract);

console.log(`✅ 新链子项目 ${chainName} 创建成功，路径: chains/${chainName}`);
