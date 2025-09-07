#!/bin/bash

# SONIC Token 网站部署助手 (Linux/Mac 版本)

set -e

echo "========================================"
echo "     SONIC Token 网站部署助手"
echo "========================================"
echo

# 检查是否存在必要文件
if [ ! -f "index.html" ]; then
    echo "❌ 错误: 找不到 index.html 文件"
    echo "请确保在 website 目录下运行此脚本"
    exit 1
fi

if [ ! -f "config.js" ]; then
    echo "❌ 错误: 找不到 config.js 文件"
    exit 1
fi

echo "✅ 文件检查完成"
echo

# 提示用户配置合约地址
echo "📝 配置合约地址"
echo
echo "请输入已部署的 SONIC Token 合约地址:"
echo "(格式: 0x开头的42位十六进制地址)"
read -p "合约地址: " CONTRACT_ADDRESS

# 验证地址格式
if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ 错误: 合约地址不能为空"
    exit 1
fi

if [[ ! $CONTRACT_ADDRESS =~ ^0x[0-9a-fA-F]{40}$ ]]; then
    echo "❌ 错误: 合约地址格式不正确"
    echo "正确格式: 0x开头的42位十六进制地址"
    exit 1
fi

echo "✅ 地址格式验证通过"
echo

# 备份原配置文件
if [ -f "config.js.backup" ]; then
    rm "config.js.backup"
fi
cp "config.js" "config.js.backup"
echo "✅ 已备份原配置文件"

# 更新配置文件
echo "📝 更新配置文件..."
if command -v sed >/dev/null 2>&1; then
    sed -i.bak "s/CONTRACT_ADDRESS: '',/CONTRACT_ADDRESS: '$CONTRACT_ADDRESS',/g" config.js
    rm config.js.bak 2>/dev/null || true
else
    echo "❌ 错误: 未找到 sed 命令"
    echo "请手动编辑 config.js 文件，将 CONTRACT_ADDRESS 设置为: $CONTRACT_ADDRESS"
    exit 1
fi

echo "✅ 配置文件更新成功"
echo

# 显示部署选项
echo "🚀 选择部署方式:"
echo
echo "1. 启动本地测试服务器 (Python)"
echo "2. 启动本地测试服务器 (Node.js)"
echo "3. 启动本地测试服务器 (PHP)"
echo "4. 显示部署说明"
echo "5. 退出"
echo
read -p "请选择 (1-5): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        echo
        echo "🐍 启动 Python 本地服务器..."
        echo "服务器地址: http://localhost:8000"
        echo "按 Ctrl+C 停止服务器"
        echo
        if command -v python3 >/dev/null 2>&1; then
            python3 -m http.server 8000
        elif command -v python >/dev/null 2>&1; then
            python -m http.server 8000
        else
            echo "❌ 错误: 未找到 Python"
            echo "请安装 Python 或选择其他部署方式"
            exit 1
        fi
        ;;
    2)
        echo
        echo "📦 检查 Node.js 环境..."
        if ! command -v node >/dev/null 2>&1; then
            echo "❌ 错误: 未找到 Node.js"
            echo "请安装 Node.js 或选择其他部署方式"
            exit 1
        fi
        
        echo "✅ Node.js 环境正常"
        echo "🚀 启动 Node.js 本地服务器..."
        echo "服务器地址: http://localhost:3000"
        echo "按 Ctrl+C 停止服务器"
        echo
        npx serve . -p 3000
        ;;
    3)
        echo
        echo "🐘 启动 PHP 本地服务器..."
        echo "服务器地址: http://localhost:8000"
        echo "按 Ctrl+C 停止服务器"
        echo
        if command -v php >/dev/null 2>&1; then
            php -S localhost:8000
        else
            echo "❌ 错误: 未找到 PHP"
            echo "请安装 PHP 或选择其他部署方式"
            exit 1
        fi
        ;;
    4)
        echo
        echo "📖 部署说明"
        echo "========================================"
        echo
        echo "🌐 在线部署选项:"
        echo
        echo "1. GitHub Pages:"
        echo "   - 将文件上传到 GitHub 仓库"
        echo "   - 在仓库设置中启用 Pages"
        echo "   - 选择主分支作为源"
        echo
        echo "2. Netlify:"
        echo "   - 访问 https://netlify.com"
        echo "   - 拖拽整个 website 文件夹到部署页面"
        echo "   - 获得自动生成的域名"
        echo
        echo "3. Vercel:"
        echo "   - 安装 Vercel CLI: npm i -g vercel"
        echo "   - 在此目录运行: vercel"
        echo "   - 按提示完成部署"
        echo
        echo "📁 本地测试:"
        echo "   - Python: python3 -m http.server 8000"
        echo "   - Node.js: npx serve ."
        echo "   - PHP: php -S localhost:8000"
        echo
        echo "⚠️  重要提醒:"
        echo "   - 确保合约地址配置正确"
        echo "   - 在 HTTPS 环境下使用"
        echo "   - 测试所有功能正常"
        echo
        read -p "按 Enter 键继续..."
        ;;
    5)
        echo "退出部署助手"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo
echo "✅ 部署助手完成"
echo "合约地址已配置为: $CONTRACT_ADDRESS"
echo
echo "📋 下一步:"
echo "1. 测试网站功能"
echo "2. 部署到生产环境"
echo "3. 更新社交媒体链接"
echo
echo "感谢使用 SONIC Token 网站部署助手!"