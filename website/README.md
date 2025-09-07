# SONIC Token 官方网站

这是 SONIC Token 的官方网站，提供代币信息展示、钱包连接和代币铸造功能。

## 功能特性

- 🌟 现代化响应式设计
- 💰 Web3 钱包连接 (MetaMask)
- 🔗 自动切换到 X Layer 网络
- 🪙 代币铸造功能
- 📊 实时合约信息显示
- 📱 移动端友好界面

## 文件结构

```
website/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # JavaScript 功能
└── README.md           # 说明文档
```

## 部署前配置

### 1. 更新合约地址

在 `script.js` 文件中找到 `CONTRACT_CONFIG` 对象，将合约地址填入：

```javascript
const CONTRACT_CONFIG = {
    address: 'YOUR_CONTRACT_ADDRESS_HERE', // 填入实际部署的合约地址
    abi: [...] // ABI 已配置好
};
```

### 2. 验证网络配置

确认 X Layer 网络配置正确：

```javascript
const XLAYER_CONFIG = {
    chainId: '0xC4', // 196 in hex
    chainName: 'X Layer Mainnet',
    nativeCurrency: {
        name: 'OKB',
        symbol: 'OKB',
        decimals: 18
    },
    rpcUrls: ['https://rpc.xlayer.tech'],
    blockExplorerUrls: ['https://www.oklink.com/xlayer']
};
```

## 部署方式

### 方式一：本地测试

1. 在 `website` 目录下启动本地服务器：
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 或使用 Node.js
   npx serve .
   
   # 或使用 PHP
   php -S localhost:8000
   ```

2. 在浏览器中访问 `http://localhost:8000`

### 方式二：GitHub Pages

1. 将 `website` 文件夹内容推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支作为源
4. 访问生成的 GitHub Pages URL

### 方式三：Netlify

1. 将 `website` 文件夹拖拽到 [Netlify](https://netlify.com) 部署页面
2. 或连接 GitHub 仓库自动部署
3. 获得自动生成的域名

### 方式四：Vercel

1. 安装 Vercel CLI：`npm i -g vercel`
2. 在 `website` 目录下运行：`vercel`
3. 按提示完成部署

## 使用说明

### 用户操作流程

1. **访问网站**：用户打开网站首页
2. **连接钱包**：点击"连接钱包"按钮
3. **网络切换**：自动提示切换到 X Layer 网络
4. **查看信息**：查看代币信息和铸造状态
5. **铸造代币**：支付 0.04 OKB 铸造 500 SONIC 代币

### 功能说明

#### 钱包连接
- 支持 MetaMask 和其他 Web3 钱包
- 自动检测和切换到 X Layer 网络
- 显示连接状态和账户地址

#### 代币铸造
- 检查用户是否已铸造过
- 验证账户余额是否足够
- 实时显示铸造状态
- 交易确认和错误处理

#### 信息展示
- 实时合约余额
- 用户铸造状态
- 代币基本信息
- 合约地址复制功能

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **Web3**：Web3.js
- **样式**：响应式设计，CSS Grid/Flexbox
- **图标**：Font Awesome
- **网络**：X Layer (OKX Chain)

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 安全注意事项

1. **合约地址验证**：确保填入正确的合约地址
2. **网络安全**：只在 HTTPS 环境下使用
3. **钱包安全**：提醒用户保护好私钥
4. **交易确认**：用户需要在钱包中确认每笔交易

## 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查是否安装了 MetaMask
   - 确认钱包已解锁
   - 刷新页面重试

2. **网络切换失败**
   - 手动添加 X Layer 网络
   - 检查网络配置是否正确

3. **铸造失败**
   - 检查账户余额是否足够
   - 确认是否已经铸造过
   - 检查合约地址是否正确

4. **页面显示异常**
   - 清除浏览器缓存
   - 检查控制台错误信息
   - 确认所有文件路径正确

## 更新日志

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 基础钱包连接功能
- 代币铸造功能
- 响应式设计
- X Layer 网络支持

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues
- Telegram 群组
- Discord 频道

## 许可证

MIT License - 详见 LICENSE 文件