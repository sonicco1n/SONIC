// 网站配置文件
// 部署合约后，请更新此文件中的合约地址

// 合约配置
const WEBSITE_CONFIG = {
    // 合约地址 - 已更新为实际部署地址
    CONTRACT_ADDRESS: '0x63C736Ef8d7De4Fc34Ff19354910ddf9165A44E8',
    
    // 网站信息
    SITE_INFO: {
        title: 'SONIC Token - 官方网站',
        description: '基于X Layer网络的创新代币，具有独特的铸造机制和流动性管理功能',
        keywords: 'SONIC, Token, X Layer, OKB, DeFi, 代币'
    },
    
    // 社交媒体链接
    SOCIAL_LINKS: {
        twitter: 'https://x.com/SONIC_CO1N',
        telegram: '#',
        discord: '#'
    },
    
    // 代币信息
    TOKEN_INFO: {
        name: 'SONIC',
        symbol: 'SONIC',
        totalSupply: '21,000,000',
        decimals: 18,
        mintPrice: '0.04 OKB',
        userReward: '500 SONIC'
    }
};

// 配置验证函数
function validateConfig() {
    const errors = [];
    
    if (!WEBSITE_CONFIG.CONTRACT_ADDRESS) {
        errors.push('合约地址未配置');
    }
    
    if (!WEBSITE_CONFIG.CONTRACT_ADDRESS.startsWith('0x')) {
        errors.push('合约地址格式不正确');
    }
    
    if (WEBSITE_CONFIG.CONTRACT_ADDRESS.length !== 42) {
        errors.push('合约地址长度不正确');
    }
    
    return errors;
}

// 应用配置到页面
function applyConfig() {
    // 更新页面标题
    document.title = WEBSITE_CONFIG.SITE_INFO.title;
    
    // 更新meta描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = WEBSITE_CONFIG.SITE_INFO.description;
    }
    
    // 更新社交媒体链接
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        const platform = link.querySelector('i').className;
        if (platform.includes('twitter')) {
            link.href = WEBSITE_CONFIG.SOCIAL_LINKS.twitter;
        } else if (platform.includes('telegram')) {
            link.href = WEBSITE_CONFIG.SOCIAL_LINKS.telegram;
        } else if (platform.includes('discord')) {
            link.href = WEBSITE_CONFIG.SOCIAL_LINKS.discord;
        }
    });
    
    // 更新合约地址到 script.js 配置
    if (typeof CONTRACT_CONFIG !== 'undefined') {
        CONTRACT_CONFIG.address = WEBSITE_CONFIG.CONTRACT_ADDRESS;
    }
}

// 页面加载时应用配置
document.addEventListener('DOMContentLoaded', function() {
    const errors = validateConfig();
    
    if (errors.length > 0) {
        console.warn('配置验证失败:', errors);
        
        // 在页面上显示配置提示
        const configNotice = document.createElement('div');
        configNotice.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff6b6b;
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 10000;
            font-weight: bold;
        `;
        configNotice.innerHTML = `
            ⚠️ 网站配置未完成：${errors.join(', ')}
            <br>
            请在 config.js 文件中配置合约地址
        `;
        document.body.insertBefore(configNotice, document.body.firstChild);
    } else {
        applyConfig();
        console.log('✅ 网站配置已加载');
    }
});

// 导出配置供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WEBSITE_CONFIG;
}

// 全局访问
window.WEBSITE_CONFIG = WEBSITE_CONFIG;