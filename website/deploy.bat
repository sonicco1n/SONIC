@echo off
chcp 65001 >nul
echo ========================================
echo     SONIC Token 网站部署助手
echo ========================================
echo.

:: 检查是否存在必要文件
if not exist "index.html" (
    echo ❌ 错误: 找不到 index.html 文件
    echo 请确保在 website 目录下运行此脚本
    pause
    exit /b 1
)

if not exist "config.js" (
    echo ❌ 错误: 找不到 config.js 文件
    pause
    exit /b 1
)

echo ✅ 文件检查完成
echo.

:: 提示用户配置合约地址
echo 📝 配置合约地址
echo.
echo 请输入已部署的 SONIC Token 合约地址:
echo (格式: 0x开头的42位十六进制地址)
set /p CONTRACT_ADDRESS="合约地址: "

:: 验证地址格式
if "%CONTRACT_ADDRESS%"=="" (
    echo ❌ 错误: 合约地址不能为空
    pause
    exit /b 1
)

echo %CONTRACT_ADDRESS% | findstr /r "^0x[0-9a-fA-F]\{40\}$" >nul
if errorlevel 1 (
    echo ❌ 错误: 合约地址格式不正确
    echo 正确格式: 0x开头的42位十六进制地址
    pause
    exit /b 1
)

echo ✅ 地址格式验证通过
echo.

:: 备份原配置文件
if exist "config.js.backup" del "config.js.backup"
copy "config.js" "config.js.backup" >nul
echo ✅ 已备份原配置文件

:: 更新配置文件
echo 📝 更新配置文件...
powershell -Command "(Get-Content 'config.js') -replace \"CONTRACT_ADDRESS: '',\", \"CONTRACT_ADDRESS: '%CONTRACT_ADDRESS%',\" | Set-Content 'config.js'"

if errorlevel 1 (
    echo ❌ 错误: 配置文件更新失败
    echo 正在恢复备份...
    copy "config.js.backup" "config.js" >nul
    pause
    exit /b 1
)

echo ✅ 配置文件更新成功
echo.

:: 显示部署选项
echo 🚀 选择部署方式:
echo.
echo 1. 启动本地测试服务器 (Python)
echo 2. 启动本地测试服务器 (Node.js)
echo 3. 显示部署说明
echo 4. 退出
echo.
set /p DEPLOY_CHOICE="请选择 (1-4): "

if "%DEPLOY_CHOICE%"=="1" goto :python_server
if "%DEPLOY_CHOICE%"=="2" goto :node_server
if "%DEPLOY_CHOICE%"=="3" goto :deploy_info
if "%DEPLOY_CHOICE%"=="4" goto :end

echo ❌ 无效选择
pause
exit /b 1

:python_server
echo.
echo 🐍 启动 Python 本地服务器...
echo 服务器地址: http://localhost:8000
echo 按 Ctrl+C 停止服务器
echo.
python -m http.server 8000
goto :end

:node_server
echo.
echo 📦 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js
    echo 请安装 Node.js 或选择其他部署方式
    pause
    goto :end
)

echo ✅ Node.js 环境正常
echo 🚀 启动 Node.js 本地服务器...
echo 服务器地址: http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo.
npx serve . -p 3000
goto :end

:deploy_info
echo.
echo 📖 部署说明
echo ========================================
echo.
echo 🌐 在线部署选项:
echo.
echo 1. GitHub Pages:
echo    - 将文件上传到 GitHub 仓库
echo    - 在仓库设置中启用 Pages
echo    - 选择主分支作为源
echo.
echo 2. Netlify:
echo    - 访问 https://netlify.com
echo    - 拖拽整个 website 文件夹到部署页面
echo    - 获得自动生成的域名
echo.
echo 3. Vercel:
echo    - 安装 Vercel CLI: npm i -g vercel
echo    - 在此目录运行: vercel
echo    - 按提示完成部署
echo.
echo 📁 本地测试:
echo    - Python: python -m http.server 8000
echo    - Node.js: npx serve .
echo    - PHP: php -S localhost:8000
echo.
echo ⚠️  重要提醒:
echo    - 确保合约地址配置正确
echo    - 在 HTTPS 环境下使用
echo    - 测试所有功能正常
echo.
pause
goto :end

:end
echo.
echo ✅ 部署助手完成
echo 合约地址已配置为: %CONTRACT_ADDRESS%
echo.
echo 📋 下一步:
echo 1. 测试网站功能
echo 2. 部署到生产环境
echo 3. 更新社交媒体链接
echo.
echo 感谢使用 SONIC Token 网站部署助手!
pause