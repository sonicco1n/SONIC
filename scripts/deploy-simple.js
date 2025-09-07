const hre = require("hardhat");

async function main() {
  console.log("开始部署 BottleToken 合约...");

  // 获取部署者账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);

  // 获取账户余额
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(balance), "ETH");

  // 部署合约
  console.log("\n正在部署合约...");
  const BottleToken = await hre.ethers.getContractFactory("BottleToken");
  const bottleToken = await BottleToken.deploy();

  await bottleToken.waitForDeployment();

  const contractAddress = await bottleToken.getAddress();
  console.log("✅ BottleToken 合约已部署到:", contractAddress);

  // 保存部署信息
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: bottleToken.deploymentTransaction()?.hash,
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  console.log("\n=== 部署信息 ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // 如果是测试网或主网，提示验证合约
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n=== 合约验证 ===");
    console.log("请等待几个区块确认后，使用以下命令验证合约:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
  }

  console.log("\n✅ 部署完成!");
  console.log("\n📋 重要信息:");
  console.log("合约地址:", contractAddress);
  console.log("网络:", hre.network.name);
  console.log("部署者:", deployer.address);
  
  console.log("\n⚠️  重要提醒:");
  console.log("1. 请保存好合约地址和部署信息");
  console.log("2. 合约部署者是开发者，拥有管理权限");
  console.log("3. 用户需要发送 0.04 ETH 来铸造代币");
  console.log("4. 每个地址只能铸造一次");
  console.log("5. 铸造时会自动添加流动性到 X Layer DEX");
  console.log("6. 开发者可以控制买入、卖出和交易功能");
  console.log("7. 开发者和合约地址为固定白名单，不受买卖限制");
  console.log("8. 铸造功能始终开启，直到合约代币耗尽");
  console.log("9. 默认情况下买入和交易功能关闭，只允许卖出");
  console.log("10. 合约部署在 X Layer 网络上，使用 WOKB 进行流动性配对");
  
  console.log("\n🌐 更新网站配置:");
  console.log(`请在 website/config.js 中将合约地址更新为: ${contractAddress}`);
}

// 错误处理
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });