// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IUniswapV2Router {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    
    function WETH() external pure returns (address);
}

contract BottleToken is IERC20 {
    string public constant name = "SONIC";
    string public constant symbol = "SONIC";
    uint8 public constant decimals = 18;
    uint256 public constant override totalSupply = 21000000 * 10**decimals;
    
    address public developer;
    address public constant WOKB = 0xe538905cf8410324e03A5A23C1c177a474D59b2b;
    address public constant ROUTER = 0x881fB2f98c13d521009464e7D1CBf16E1b394e8E;
    
    uint256 public constant MINT_AMOUNT = 0.04 ether;
    uint256 public constant USER_REWARD = 500 * 10**decimals;
    uint256 public constant LIQUIDITY_TOKEN_AMOUNT = 500 * 10**decimals;
    uint256 public constant LIQUIDITY_ETH_AMOUNT = 0.02 ether;
    uint256 public constant DEVELOPER_FEE = 0.02 ether;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) public hasMinted;
    mapping(address => bool) public whitelist;
    
    bool private _locked;
    
    bool public sellingEnabled = true;
    bool public buyingEnabled = false;
    bool public tradingEnabled = false;
    
    event Mint(address indexed user, uint256 okbAmount, uint256 tokenAmount);
    event LiquidityAdded(address indexed user, uint256 okbAmount, uint256 tokenAmount, uint256 liquidity);
    event FundsWithdrawn(address indexed developer, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipRenounced(address indexed previousDeveloper);
    event SellingStatusChanged(bool enabled);
    event BuyingStatusChanged(bool enabled);
    event TradingStatusChanged(bool enabled);
    event DeveloperFeeTransferred(address indexed developer, uint256 amount);
    
    modifier onlyDeveloper() {
        require(msg.sender == developer, "Only developer can call this function");
        _;
    }
    
    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }
    

    
    modifier whenSellingEnabled() {
        require(sellingEnabled, "Selling is currently disabled");
        _;
    }
    
    constructor() {
        developer = msg.sender;
        whitelist[developer] = true;
        whitelist[address(this)] = true;
        _balances[address(this)] = totalSupply;
        emit Transfer(address(0), address(this), totalSupply);
    }
    
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public override returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    

    
    function setSellingEnabled(bool _enabled) external onlyDeveloper {
        sellingEnabled = _enabled;
        emit SellingStatusChanged(_enabled);
    }
    
    function setBuyingEnabled(bool _enabled) external onlyDeveloper {
        buyingEnabled = _enabled;
        emit BuyingStatusChanged(_enabled);
    }
    
    function setTradingEnabled(bool _enabled) external onlyDeveloper {
        tradingEnabled = _enabled;
        emit TradingStatusChanged(_enabled);
    }
    

    
    function mintTokens() public payable {
        require(msg.value == MINT_AMOUNT, "Must send exactly 0.04 OKB");
        require(!hasMinted[msg.sender], "Address has already minted");
        require(_balances[address(this)] >= USER_REWARD + LIQUIDITY_TOKEN_AMOUNT, "Insufficient contract balance");
        
        hasMinted[msg.sender] = true;
        
        _balances[address(this)] -= USER_REWARD;
        _balances[msg.sender] += USER_REWARD;
        emit Transfer(address(this), msg.sender, USER_REWARD);
        emit Mint(msg.sender, msg.value, USER_REWARD);
        
        (bool success, ) = payable(developer).call{value: DEVELOPER_FEE}("");
        require(success, "Developer fee transfer failed");
        emit DeveloperFeeTransferred(developer, DEVELOPER_FEE);
        
        _addLiquidity(msg.sender);
    }
    
    function _addLiquidity(address user) private {
        require(_balances[address(this)] >= LIQUIDITY_TOKEN_AMOUNT, "Insufficient tokens for liquidity");
        require(address(this).balance >= LIQUIDITY_ETH_AMOUNT, "Insufficient ETH for liquidity");
        
        _balances[address(this)] -= LIQUIDITY_TOKEN_AMOUNT;
        _approve(address(this), ROUTER, LIQUIDITY_TOKEN_AMOUNT);
        
        IUniswapV2Router router = IUniswapV2Router(ROUTER);
        
        uint256 minTokenAmount = LIQUIDITY_TOKEN_AMOUNT * 95 / 100;
        uint256 minETHAmount = LIQUIDITY_ETH_AMOUNT * 95 / 100;
        
        try router.addLiquidityETH{value: LIQUIDITY_ETH_AMOUNT}(
            address(this),
            LIQUIDITY_TOKEN_AMOUNT,
            minTokenAmount,
            minETHAmount,
            developer,
            block.timestamp + 300
        ) returns (uint amountToken, uint amountETH, uint liquidity) {
            emit LiquidityAdded(user, amountETH, amountToken, liquidity);
        } catch {
            _balances[address(this)] += LIQUIDITY_TOKEN_AMOUNT;
            emit LiquidityAdded(user, 0, 0, 0);
        }
    }
    
    function canMint(address user) public view returns (bool) {
        return !hasMinted[user] && _balances[address(this)] >= USER_REWARD + LIQUIDITY_TOKEN_AMOUNT;
    }
    
    function getContractInfo() public view returns (
        uint256 contractTokenBalance,
        uint256 contractETHBalance,
        bool userCanMint,
        bool userHasMinted,
        bool userIsWhitelisted,
        bool sellingStatus,
        bool buyingStatus,
        bool tradingStatus
    ) {
        contractTokenBalance = _balances[address(this)];
        contractETHBalance = address(this).balance;
        userCanMint = canMint(msg.sender);
        userHasMinted = hasMinted[msg.sender];
        userIsWhitelisted = whitelist[msg.sender];
        sellingStatus = sellingEnabled;
        buyingStatus = buyingEnabled;
        tradingStatus = tradingEnabled;
    }
    
    function simpleReceive() public payable {
        require(msg.value > 0, "Must send some ETH");
    }
    
    function withdrawFunds() external onlyDeveloper {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(developer).call{value: balance}("");
        require(success, "Transfer failed");
        emit FundsWithdrawn(developer, balance);
    }
    
    function withdrawTokens(uint256 amount) external onlyDeveloper {
        require(_balances[address(this)] >= amount, "Insufficient token balance");
        
        _balances[address(this)] -= amount;
        _balances[developer] += amount;
        emit Transfer(address(this), developer, amount);
    }
    
    function renounceOwnership() external onlyDeveloper {
        address previousDeveloper = developer;
        developer = address(0);
        emit OwnershipRenounced(previousDeveloper);
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        
        // 白名单地址不受限制
        bool fromWhitelisted = whitelist[from];
        bool toWhitelisted = whitelist[to];
        
        // 如果交易双方都不在白名单中，需要检查交易限制
        if (!fromWhitelisted && !toWhitelisted) {
            require(tradingEnabled, "Trading is currently disabled");
        }
        // 如果只有发送方不在白名单中（卖出操作）
        else if (!fromWhitelisted && toWhitelisted) {
            require(sellingEnabled, "Selling is currently disabled");
        }
        // 如果只有接收方不在白名单中（买入操作）
        else if (fromWhitelisted && !toWhitelisted) {
            require(buyingEnabled, "Buying is currently disabled");
        }
        // 如果双方都在白名单中，不受限制
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        unchecked {
            _balances[from] = fromBalance - amount;
            _balances[to] += amount;
        }
        
        emit Transfer(from, to, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
    
    receive() external payable nonReentrant {
        mintTokens();
    }
}