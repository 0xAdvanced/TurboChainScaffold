import { run } from "hardhat";
import { promises as fs } from "fs";
import path from "path";

async function main() {
  console.log("🔄 开始编译合约...");
  
  try {
    // 编译合约
    await run("compile");
    console.log("✅ 合约编译成功!");
    
    // 获取编译后的 ABI
    const artifactsDir = path.join(__dirname, "../artifacts/contracts");
    const contractName = "Counter.sol";
    const abiPath = path.join(artifactsDir, contractName, "Counter.json");
    
    const abiFile = await fs.readFile(abiPath, "utf8");
    const abiJson = JSON.parse(abiFile);
    
    // 提取 ABI 和字节码
    const { abi, bytecode } = abiJson;
    
    // 创建简化版的 ABI 文件
    const outputDir = path.join(__dirname, "../../../apps/dapp-ui/contracts/abis");
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, "Counter.json");
    await fs.writeFile(
      outputPath,
      JSON.stringify({ abi, bytecode }, null, 2)
    );
    
    console.log(`✅ ABI 已保存到: ${outputPath}`);
    console.log("🎉 编译流程完成!");
  } catch (error) {
    console.error("❌ 编译过程中出错:");
    console.error(error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ 未处理的错误:");
  console.error(error);
  process.exitCode = 1;
}); 