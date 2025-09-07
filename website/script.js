// 合约配置
const CONTRACT_CONFIG = {
    // 从config.js获取合约地址
    address: WEBSITE_CONFIG.CONTRACT_ADDRESS,
    abi: [
        {
            "inputs": [],
            "name": "name",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "mintTokens",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
            "name": "canMint",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "", "type": "address"}],
            "name": "hasMinted",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getContractInfo",
            "outputs": [
                {"internalType": "uint256", "name": "contractTokenBalance", "type": "uint256"},
                {"internalType": "uint256", "name": "contractETHBalance", "type": "uint256"},
                {"internalType": "bool", "name": "userCanMint", "type": "bool"},
                {"internalType": "bool", "name": "userHasMinted", "type": "bool"},
                {"internalType": "bool", "name": "userIsWhitelisted", "type": "bool"},
                {"internalType": "bool", "name": "sellingStatus", "type": "bool"},
                {"internalType": "bool", "name": "buyingStatus", "type": "bool"},
                {"internalType": "bool", "name": "tradingStatus", "type": "bool"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
                {"indexed": false, "internalType": "uint256", "name": "okbAmount", "type": "uint256"},
                {"indexed": false, "internalType": "uint256", "name": "tokenAmount", "type": "uint256"}
            ],
            "name": "Mint",
            "type": "event"
        }
    ]
};

// X Layer 网络配置
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

// 全局变量
let web3;
let contract;
let userAccount;
let isConnected = false;

// DOM 元素
const connectWalletBtn = document.getElementById('connectWallet');
const mintButton = document.getElementById('mintButton');
const mintStatus = document.getElementById('mintStatus');
const contractAddress = document.getElementById('contractAddress');
const contractBalance = document.getElementById('contractBalance');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// 应用初始化
function initializeApp() {
    // 检测移动端并显示提示
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const mobileWalletTip = document.getElementById('mobileWalletTip');
    
    if (isMobile && mobileWalletTip) {
        // 检查是否在 OKX App 内
        const isInOKXApp = navigator.userAgent.includes('OKApp') || window.okxwallet;
        if (!isInOKXApp) {
            mobileWalletTip.style.display = 'block';
            // 5秒后自动隐藏提示
            setTimeout(() => {
                mobileWalletTip.style.display = 'none';
            }, 5000);
        }
    }
    
    // 延迟检查钱包连接，确保钱包完全加载
    setTimeout(() => {
        checkWalletConnection();
    }, isMobile ? 2000 : 500);
    
    // 设置合约地址显示
    if (CONTRACT_CONFIG.address) {
        contractAddress.innerHTML = `
            <i class="fas fa-file-contract"></i>
            合约地址: <span onclick="copyAddress()" style="cursor: pointer; text-decoration: underline;">
                ${formatAddress(CONTRACT_CONFIG.address)}
            </span>
        `;
    }
    
    // 如果没有合约地址，显示提示
    if (!CONTRACT_CONFIG.address) {
        mintStatus.textContent = '合约未部署';
        mintStatus.className = 'status unavailable';
        mintButton.textContent = '合约未部署';
        mintButton.disabled = true;
    }
    
    // 添加移动端触摸优化
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
}

// 设置事件监听器
function setupEventListeners() {
    connectWalletBtn.addEventListener('click', connectWallet);
    mintButton.addEventListener('click', mintTokens);
    
    // 延迟设置钱包事件监听器，确保钱包完全加载
    setTimeout(() => {
        const walletInfo = detectWallet();
        if (walletInfo && walletInfo.provider) {
            try {
                walletInfo.provider.on('accountsChanged', handleAccountsChanged);
                walletInfo.provider.on('chainChanged', handleChainChanged);
                console.log('钱包事件监听器已设置');
            } catch (error) {
                console.warn('设置钱包事件监听器失败:', error);
            }
        }
    }, 1000);
}

// 检查钱包连接状态
async function checkWalletConnection() {
    const walletInfo = detectWallet();
    
    if (walletInfo) {
        try {
            // 移动端延迟检查
            if (walletInfo.isMobile) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            const accounts = await walletInfo.provider.request({ 
                method: 'eth_accounts',
                params: []
            });
            
            if (accounts.length > 0) {
                // 自动连接已授权的钱包
                web3 = new Web3(walletInfo.provider);
                userAccount = accounts[0];
                isConnected = true;
                
                // 检查网络
                try {
                    const chainId = await walletInfo.provider.request({ method: 'eth_chainId' });
                    if (chainId !== XLAYER_CONFIG.chainId) {
                        console.log('需要切换到 X Layer 网络');
                        // 不自动切换，让用户手动操作
                    }
                } catch (networkError) {
                    console.warn('网络检查失败:', networkError);
                }
                
                // 初始化合约
                if (CONTRACT_CONFIG.address) {
                    contract = new web3.eth.Contract(CONTRACT_CONFIG.abi, CONTRACT_CONFIG.address);
                }
                
                // 更新 UI
                updateWalletUI(walletInfo.name);
                
                // 更新合约信息
                if (contract) {
                    try {
                        await updateContractInfo();
                    } catch (contractError) {
                        console.warn('合约信息更新失败:', contractError);
                    }
                }
                
                console.log(`${walletInfo.name} 自动连接成功:`, userAccount);
            }
        } catch (error) {
            console.error('检查钱包连接失败:', error);
            // 不显示错误提示，静默失败
        }
    }
}

// 检测可用的钱包
function detectWallet() {
    // 移动端优先检测
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // OKX Wallet 检测 - 多种方式
    if (window.okxwallet && window.okxwallet.ethereum) {
        return { provider: window.okxwallet.ethereum, name: 'OKX Wallet', isMobile };
    }
    
    if (window.ethereum) {
        // 检查是否为 OKX Wallet
        if (window.ethereum.isOkxWallet || 
            (window.ethereum.providers && window.ethereum.providers.find(p => p.isOkxWallet))) {
            return { provider: window.ethereum, name: 'OKX Wallet', isMobile };
        }
        
        // MetaMask 检测
        if (window.ethereum.isMetaMask) {
            return { provider: window.ethereum, name: 'MetaMask', isMobile };
        }
        
        // 通用 Web3 钱包
        return { provider: window.ethereum, name: 'Web3 Wallet', isMobile };
    }
    
    return null;
}

// 连接钱包
async function connectWallet() {
    const walletInfo = detectWallet();
    
    if (!walletInfo) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        let message;
        
        if (isMobile) {
            message = '移动端钱包连接说明:\n\n' +
                     '1. 推荐使用 OKX App 内置浏览器打开此页面\n' +
                     '2. 或下载 OKX Wallet 移动应用\n' +
                     '3. 确保钱包应用已安装并设置完成\n\n' +
                     '如果问题持续，请尝试刷新页面。';
        } else {
            message = '请安装 OKX Wallet 或 MetaMask 钱包!\n\n推荐使用 OKX Wallet 以获得最佳体验。';
        }
        
        alert(message);
        return;
    }

    // 显示加载状态
    const originalText = connectWalletBtn.innerHTML;
    connectWalletBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 连接中...';
    connectWalletBtn.disabled = true;

    try {
        // 使用检测到的钱包提供者
        const provider = walletInfo.provider;
        
        // 移动端特殊处理
        if (walletInfo.isMobile) {
            // 添加延迟以确保钱包应用有时间响应
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 请求连接钱包
        const accounts = await provider.request({ 
            method: 'eth_requestAccounts',
            params: []
        });
        
        if (accounts.length === 0) {
            throw new Error('未选择账户');
        }

        // 检查并切换到 X Layer 网络
        connectWalletBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 切换网络...';
        await switchToXLayer(provider);

        // 初始化 Web3
        connectWalletBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 初始化...';
        web3 = new Web3(provider);
        userAccount = accounts[0];
        isConnected = true;

        // 初始化合约
        if (CONTRACT_CONFIG.address) {
            contract = new web3.eth.Contract(CONTRACT_CONFIG.abi, CONTRACT_CONFIG.address);
        }

        // 更新 UI
        updateWalletUI(walletInfo.name);
        
        // 更新合约信息
        if (contract) {
            await updateContractInfo();
        }

        console.log(`${walletInfo.name} 连接成功:`, userAccount);
    } catch (error) {
        console.error('连接钱包失败:', error);
        
        // 根据错误类型提供不同的提示
        let errorMessage = '连接钱包失败: ';
        if (error.code === 4001) {
            errorMessage += '用户拒绝了连接请求';
        } else if (error.code === -32002) {
            errorMessage += '钱包连接请求已在处理中，请检查钱包应用';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    } finally {
        // 恢复按钮状态
        connectWalletBtn.innerHTML = originalText;
        connectWalletBtn.disabled = false;
    }
}

// 切换到 X Layer 网络
async function switchToXLayer(provider = window.ethereum) {
    try {
        // 尝试切换到 X Layer
        await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: XLAYER_CONFIG.chainId }],
        });
    } catch (switchError) {
        // 如果网络不存在，添加网络
        if (switchError.code === 4902) {
            try {
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [XLAYER_CONFIG],
                });
            } catch (addError) {
                throw new Error('添加 X Layer 网络失败');
            }
        } else {
            throw new Error('切换到 X Layer 网络失败');
        }
    }
}

// 更新钱包 UI
function updateWalletUI(walletName = '') {
    if (isConnected && userAccount) {
        const shortAddress = `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
        const displayText = walletName ? `${walletName.split(' ')[0]} ${shortAddress}` : shortAddress;
        connectWalletBtn.innerHTML = `<i class="fas fa-wallet"></i> ${displayText}`;
        connectWalletBtn.style.background = '#28a745';
        
        // 更新铸造按钮
        if (CONTRACT_CONFIG.address) {
            mintButton.disabled = false;
            mintButton.innerHTML = '<i class="fas fa-coins"></i> 铸造代币';
        }
    } else {
        connectWalletBtn.innerHTML = '<i class="fas fa-wallet"></i> 连接钱包';
        connectWalletBtn.style.background = '';
        mintButton.disabled = true;
        mintButton.innerHTML = '<i class="fas fa-coins"></i> 连接钱包以铸造';
    }
}

// 更新合约信息
async function updateContractInfo() {
    if (!contract || !userAccount) return;

    try {
        // 获取合约信息
        const contractInfo = await contract.methods.getContractInfo().call({ from: userAccount });
        
        // 更新合约余额显示
        const tokenBalance = web3.utils.fromWei(contractInfo.contractTokenBalance, 'ether');
        contractBalance.textContent = `${parseFloat(tokenBalance).toLocaleString()} SONIC`;
        
        // 更新铸造状态
        updateMintStatus(contractInfo);
        
    } catch (error) {
        console.error('获取合约信息失败:', error);
        mintStatus.textContent = '获取信息失败';
        mintStatus.className = 'status unavailable';
    }
}

// 更新铸造状态
function updateMintStatus(contractInfo) {
    const { userCanMint, userHasMinted } = contractInfo;
    
    if (userHasMinted) {
        mintStatus.textContent = '已铸造';
        mintStatus.className = 'status unavailable';
        mintButton.disabled = true;
        mintButton.innerHTML = '<i class="fas fa-check"></i> 已铸造';
    } else if (userCanMint) {
        mintStatus.textContent = '可铸造';
        mintStatus.className = 'status available';
        mintButton.disabled = false;
        mintButton.innerHTML = '<i class="fas fa-coins"></i> 铸造代币';
    } else {
        mintStatus.textContent = '暂不可铸造';
        mintStatus.className = 'status unavailable';
        mintButton.disabled = true;
        mintButton.innerHTML = '<i class="fas fa-times"></i> 暂不可铸造';
    }
}

// 铸造代币
async function mintTokens() {
    if (!contract || !userAccount) {
        alert('请先连接钱包!');
        return;
    }

    try {
        // 检查用户是否已经铸造过
        const hasMinted = await contract.methods.hasMinted(userAccount).call();
        if (hasMinted) {
            alert('您已经铸造过代币了!');
            return;
        }

        // 检查用户余额
        const balance = await web3.eth.getBalance(userAccount);
        const balanceInOKB = web3.utils.fromWei(balance, 'ether');
        if (parseFloat(balanceInOKB) < 0.04) {
            alert('余额不足! 需要至少 0.04 OKB 来铸造代币。');
            return;
        }

        // 更新按钮状态
        mintButton.disabled = true;
        mintButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 铸造中...';

        // 获取当前gas价格
        const gasPrice = await web3.eth.getGasPrice();
        
        // 估算 gas
        const gasEstimate = await contract.methods.mintTokens().estimateGas({
            from: userAccount,
            value: web3.utils.toWei('0.04', 'ether')
        });

        // 确认发送的value值
        const valueToSend = web3.utils.toWei('0.04', 'ether');
        console.log('发送的OKB数量:', web3.utils.fromWei(valueToSend, 'ether'), 'OKB');
        console.log('发送的Wei数量:', valueToSend);
        
        // 发送交易（使用传统交易格式，不使用EIP-1559）
        const tx = await contract.methods.mintTokens().send({
            from: userAccount,
            value: valueToSend,
            gas: Math.floor(Number(gasEstimate) * 1.2), // 增加 20% gas 余量
            gasPrice: gasPrice, // 使用传统gasPrice而不是EIP-1559
            type: '0x0' // 明确指定为传统交易类型
        });
        
        console.log('交易详情:', tx);
        console.log('实际发送的value:', tx.value || 'N/A');

        console.log('铸造成功:', tx);
        alert('铸造成功! 您已获得 500 SONIC 代币!');
        
        // 更新合约信息
        await updateContractInfo();
        
    } catch (error) {
        console.error('铸造失败:', error);
        
        let errorMessage = '铸造失败: ';
        let shouldUpdateStatus = true;
        
        if (error.message.includes('User denied')) {
            errorMessage += '用户取消了交易';
            shouldUpdateStatus = false; // 用户取消交易时不更新状态
        } else if (error.message.includes('insufficient funds')) {
            errorMessage += '余额不足';
        } else if (error.message.includes('already minted')) {
            errorMessage += '您已经铸造过代币了';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
        
        // 如果是用户取消交易，只恢复按钮状态，不更新合约信息
        if (!shouldUpdateStatus) {
            mintButton.disabled = false;
            mintButton.innerHTML = '<i class="fas fa-coins"></i> 铸造代币';
            return;
        }
    } finally {
        // 恢复按钮状态
        updateWalletUI();
        if (contract) {
            await updateContractInfo();
        }
    }
}

// 处理账户变化
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // 用户断开了钱包连接
        isConnected = false;
        userAccount = null;
        web3 = null;
        contract = null;
        updateWalletUI();
        mintStatus.textContent = '请连接钱包';
        mintStatus.className = 'status checking';
        console.log('钱包已断开连接');
    } else {
        // 用户切换了账户
        userAccount = accounts[0];
        const walletInfo = detectWallet();
        updateWalletUI(walletInfo ? walletInfo.name : '');
        if (contract) {
            updateContractInfo();
        }
        console.log('账户已切换:', userAccount);
    }
}

// 处理网络变化
function handleChainChanged(chainId) {
    // 重新加载页面以确保正确的网络状态
    window.location.reload();
}

// 复制合约地址
function copyAddress() {
    if (CONTRACT_CONFIG.address) {
        navigator.clipboard.writeText(CONTRACT_CONFIG.address).then(() => {
            alert('合约地址已复制到剪贴板!');
        }).catch(() => {
            // 备用复制方法
            const textArea = document.createElement('textarea');
            textArea.value = CONTRACT_CONFIG.address;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('合约地址已复制到剪贴板!');
        });
    } else {
        alert('合约地址不可用');
    }
}

// 滚动到指定部分
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// 格式化数字
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

// 格式化地址
function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 错误处理
window.addEventListener('error', function(event) {
    console.error('页面错误:', event.error);
});

// 未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的 Promise 拒绝:', event.reason);
});

// 导出函数供 HTML 使用
window.scrollToSection = scrollToSection;
window.copyAddress = copyAddress;
