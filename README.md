# SONIC Token 智能合约部署指南

这是一个基于 Solidity 的 ERC20 代币合约，名为 "SONIC Token"，部署在 X Layer 网络上，具有购买限制和自动流动性添加功能。

## 📋 合约特性

- **ERC20 标准代币**: 完全兼容 ERC20 标准
- **总供应量**: 21,000,000 SONIC
- **固定铸造机制**: 用户支付 0.04 OKB 获得 500 SONIC 代币
- **一次性铸造**: 每个地址只能铸造一次
- **自动流动性**: 铸造时自动向 Uniswap 添加流动性
- **开发者费用**: 每次铸造收取 0.02 OKB 开发者费用
- **交易控制**: 开发者可控制买入、卖出和交易功能
- **固定白名单**: 开发者和合约地址为固定白名单，不受买卖限制
- **安全保护**: 包含重入攻击保护和权限验证

## 🚀 快速开始

### 1. 环境准备

确保您的系统已安装:
- [Node.js](https://nodejs.org/) (v16 或更高版本)
- [npm](https://www.npmjs.com/) 或 [yarn](https://yarnpkg.com/)

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制环境变量模板并配置:

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的配置:

```env
# 部署者私钥 (不包含 0x 前缀)
PRIVATE_KEY=your_private_key_here

# X Layer API Key (用于合约验证)
XLAYER_API_KEY=your_xlayer_api_key_here
```

⚠️ **安全提醒**: 永远不要将包含真实私钥的 `.env` 文件提交到版本控制系统！

### 4. 编译合约

```bash
npm run compile
```

## 🌐 部署指南

### 本地测试网部署

1. 启动本地 Hardhat 网络:
```bash
npm run node
```

2. 在新终端中部署合约:
```bash
npm run deploy
```

### X Layer 测试网部署

1. 确保您的钱包在 X Layer 测试网有足够的测试币
2. 在 `hardhat.config.js` 中配置测试网私钥
3. 部署到测试网:

```bash
npm run deploy-testnet
```

### X Layer 主网部署

⚠️ **主网部署前请务必在测试网充分测试！**

1. 确保您的钱包有足够的 ETH 用于 gas 费用
2. 在 `hardhat.config.js` 中配置主网私钥
3. 部署到主网:

```bash
npm run deploy-mainnet
```

## 📁 项目结构

```
├── contracts/
│   └── BottleToken.sol      # 主合约文件
├── scripts/
│   └── deploy.js            # 部署脚本
├── hardhat.config.js        # Hardhat 配置
├── package.json             # 项目依赖
├── .env.example             # 环境变量模板
├── .gitignore              # Git 忽略文件
└── README.md               # 项目说明
```

## 🔧 合约配置

### 重要常量

- `MINT_AMOUNT`: 0.04 OKB - 每次铸造所需的 OKB 数量
- `TOKEN_AMOUNT`: 500 SONIC - 每次铸造获得的代币数量
- `DEVELOPER_FEE`: 0.02 OKB - 开发者费用
- `LIQUIDITY_ETH_AMOUNT`: 0.02 OKB - 用于添加流动性的 OKB 数量

### 交易控制状态

- `sellingEnabled`: 控制是否允许卖出代币
- `buyingEnabled`: 控制是否允许买入代币
- `tradingEnabled`: 控制是否允许普通交易
- `whitelist`: 白名单地址映射（仅开发者和合约地址）

### 网络配置

- **X Layer 测试网**:
  - RPC: `https://testrpc.xlayer.tech`
  - Chain ID: 195
  
- **X Layer 主网**:
  - RPC: `https://rpc.xlayer.tech`
  - Chain ID: 196
  - WOKB 合约地址: `0xe538905cf8410324e03A5A23C1c177a474D59b2b`
  - 路由器合约地址: `0x881fB2f98c13d521009464e7D1CBf16E1b394e8E`

## 🎯 使用说明

### 铸造代币

用户可以通过以下方式铸造代币:

1. **直接发送 OKB**: 向合约地址发送 0.04 OKB
2. **调用函数**: 调用 `mintTokens()` 函数并发送 0.04 OKB

### 开发者功能

```solidity
// 控制出售功能
setSellingEnabled(bool _enabled)

// 控制买入功能
setBuyingEnabled(bool _enabled)

// 控制交易功能
setTradingEnabled(bool _enabled)

// 提取开发者费用
withdrawDeveloperFees()

// 放弃合约所有权
renounceOwnership()
```

### 视图函数

```solidity
// 检查地址是否可以铸造
canMint(address account) returns (bool)

// 获取合约完整信息
getContractInfo() returns (
    uint256 contractTokenBalance,
    uint256 contractETHBalance,
    bool userCanMint,
    bool userHasMinted,
    bool userIsWhitelisted,
    bool sellingStatus,
    bool buyingStatus,
    bool tradingStatus
)
```

## 🔍 合约验证

部署到测试网或主网后，建议验证合约源码:

```bash
npx hardhat verify --network testnet <CONTRACT_ADDRESS>
```

## ⚠️ 安全注意事项

1. **私钥安全**: 永远不要在代码中硬编码私钥
2. **测试充分**: 主网部署前务必在测试网充分测试
3. **权限管理**: 合约部署者拥有管理权限，请谨慎使用
4. **流动性风险**: 自动添加流动性功能需要确保 Uniswap 路由器地址正确
5. **重入攻击**: 合约已实现重入保护

## 🐛 故障排除

### 常见问题

1. **编译失败**: 检查 Solidity 版本是否匹配
2. **部署失败**: 检查网络配置和账户余额
3. **交易失败**: 检查 gas 限制和网络状态

### 获取帮助

如果遇到问题，请检查:
- Hardhat 文档: https://hardhat.org/docs
- OKX Chain 文档: https://www.okx.com/okc
- Solidity 文档: https://docs.soliditylang.org

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**免责声明**: 此合约仅供学习和测试使用。在生产环境中使用前，请进行充分的安全审计。