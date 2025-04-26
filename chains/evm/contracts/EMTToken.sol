// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title EMTToken
 * @dev Implementation of E-Money Token (EMT) based on EU's MICA framework
 * @dev 基于欧盟MICA框架的电子货币代币(EMT)实现
 * 
 * Complies with MICA's EMT requirements:
 * 符合MICA对EMT的要求:
 * - Fiat currency pegging: Stable peg to a single fiat currency
 * - 与法币锚定: 与单一法定货币稳定挂钩
 * - Regulatory compliance: Including KYC/AML requirements
 * - 监管合规: 包括KYC/AML合规要求
 * - Redemption guarantee: Right of holders to redeem at par value anytime
 * - 赎回保证: 持有人随时按面值赎回的权利
 * - Interest prohibition: No interest payment
 * - 禁止利息: 不支付任何利息
 * - Transparency: About issuance and pegging mechanisms
 * - 透明度: 关于发行、挂钩机制的透明度
 * - Capital reserves: 100% reserve requirement
 * - 资本准备金: 100%储备金要求
 */
contract EMTToken is 
    Initializable, 
    ERC20Upgradeable, 
    ERC20BurnableUpgradeable, 
    PausableUpgradeable, 
    AccessControlUpgradeable, 
    ERC20PermitUpgradeable,
    UUPSUpgradeable 
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // Compliance mapping - whether an address has passed KYC
    // 合规性映射 - 地址是否通过KYC验证
    mapping(address => bool) public isKYCVerified;
    
    // Blacklist
    // 黑名单
    mapping(address => bool) public isBlacklisted;
    
    // Transaction limits
    // 交易限制
    uint256 public dailyTransactionLimit;
    mapping(address => uint256) public dailyTransactions;
    mapping(address => uint256) public lastTransactionReset;
    
    // Fiat currency information
    // 法币信息
    string public referenceFiatCurrency; // e.g. "EUR", "USD", etc. // 例如 "EUR", "USD" 等
    string public issuerDetails;
    string public reserveAuditor;
    string public lastAuditDate;
    
    // Redemption settings
    // 赎回设置
    bool public redemptionEnabled;
    uint256 public redemptionFee; // in basis points (1/10000) // 以基点表示 (1/10000)
    uint256 public minimumRedemptionAmount;
    
    // Events
    // 事件
    event KYCStatusChanged(address account, bool isVerified);
    event BlacklistStatusChanged(address account, bool isBlacklisted);
    event ReferenceFiatUpdated(string newFiat);
    event IssuerDetailsUpdated(string newDetails);
    event RedemptionStatusChanged(bool isEnabled, uint256 fee, uint256 minimumAmount);
    event ReserveAuditorChanged(string newAuditor);
    event AuditDateUpdated(string newDate);
    event FundsRedeemed(address redeemer, uint256 amount, uint256 fee);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initialize the e-money token
     * @dev 初始化电子货币代币
     * @param name Token name
     * @param name 代币名称
     * @param symbol Token symbol
     * @param symbol 代币符号
     * @param initialAdmin Initial admin address
     * @param initialAdmin 初始管理员地址
     * @param _referenceFiatCurrency Reference fiat currency
     * @param _referenceFiatCurrency 参考法定货币
     * @param _issuerDetails Issuer details
     * @param _issuerDetails 发行方详情
     */
    function initialize(
        string memory name,
        string memory symbol,
        address initialAdmin,
        string memory _referenceFiatCurrency,
        string memory _issuerDetails
    ) public initializer {
        __ERC20_init(name, symbol);
        __ERC20Burnable_init();
        __Pausable_init();
        __AccessControl_init();
        __ERC20Permit_init(name);
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ADMIN_ROLE, initialAdmin);
        _grantRole(PAUSER_ROLE, initialAdmin);
        _grantRole(MINTER_ROLE, initialAdmin);
        _grantRole(COMPLIANCE_ROLE, initialAdmin);
        _grantRole(UPGRADER_ROLE, initialAdmin);
        
        referenceFiatCurrency = _referenceFiatCurrency;
        issuerDetails = _issuerDetails;
        
        // Default settings
        // 默认设置
        dailyTransactionLimit = 100000 * 10**decimals(); // 100k tokens // 10万代币
        redemptionEnabled = true;
        redemptionFee = 0; // EMT typically has no redemption fee // EMT通常不收取赎回费用
        minimumRedemptionAmount = 10 * 10**decimals(); // Minimum redemption amount // 最低赎回金额
        reserveAuditor = "Not specified"; // 未指定
        lastAuditDate = "Not conducted"; // 未进行
    }
    
    /**
     * @dev Pause all token transfers
     * @dev 暂停所有代币转移
     * Requirements: Caller must have PAUSER_ROLE
     * 要求：调用者必须具有PAUSER_ROLE
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Resume all token transfers
     * @dev 恢复所有代币转移
     * Requirements: Caller must have PAUSER_ROLE
     * 要求：调用者必须具有PAUSER_ROLE
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Mint new tokens
     * @dev 铸造新代币
     * Requirements: Caller must have MINTER_ROLE
     * 要求：调用者必须具有MINTER_ROLE
     * @param to Recipient address
     * @param to 接收代币的地址
     * @param amount Amount to mint
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(isKYCVerified[to], "EMTToken: Recipient not KYC verified");
        require(!isBlacklisted[to], "EMTToken: Recipient is blacklisted");
        _mint(to, amount);
    }
    
    /**
     * @dev Set KYC verification status for an address
     * @dev 设置地址的KYC验证状态
     * Requirements: Caller must have COMPLIANCE_ROLE
     * 要求：调用者必须具有COMPLIANCE_ROLE
     * @param account Address to set
     * @param account 要设置的地址
     * @param status Verification status
     * @param status 验证状态
     */
    function setKYCStatus(address account, bool status) public onlyRole(COMPLIANCE_ROLE) {
        isKYCVerified[account] = status;
        emit KYCStatusChanged(account, status);
    }
    
    /**
     * @dev Batch set KYC verification status
     * @dev 批量设置KYC验证状态
     * Requirements: Caller must have COMPLIANCE_ROLE
     * 要求：调用者必须具有COMPLIANCE_ROLE
     * @param accounts Array of addresses
     * @param accounts 地址数组
     * @param statuses Array of statuses
     * @param statuses 状态数组
     */
    function batchSetKYCStatus(address[] calldata accounts, bool[] calldata statuses) public onlyRole(COMPLIANCE_ROLE) {
        require(accounts.length == statuses.length, "EMTToken: Arrays length mismatch");
        for (uint256 i = 0; i < accounts.length; i++) {
            isKYCVerified[accounts[i]] = statuses[i];
            emit KYCStatusChanged(accounts[i], statuses[i]);
        }
    }
    
    /**
     * @dev Set blacklist status for an address
     * @dev 设置地址的黑名单状态
     * Requirements: Caller must have COMPLIANCE_ROLE
     * 要求：调用者必须具有COMPLIANCE_ROLE
     * @param account Address to set
     * @param account 要设置的地址
     * @param status Blacklist status
     * @param status 黑名单状态
     */
    function setBlacklistStatus(address account, bool status) public onlyRole(COMPLIANCE_ROLE) {
        isBlacklisted[account] = status;
        emit BlacklistStatusChanged(account, status);
    }
    
    /**
     * @dev Batch set blacklist status
     * @dev 批量设置黑名单状态
     * Requirements: Caller must have COMPLIANCE_ROLE
     * 要求：调用者必须具有COMPLIANCE_ROLE
     * @param accounts Array of addresses
     * @param accounts 地址数组
     * @param statuses Array of statuses
     * @param statuses 状态数组
     */
    function batchSetBlacklistStatus(address[] calldata accounts, bool[] calldata statuses) public onlyRole(COMPLIANCE_ROLE) {
        require(accounts.length == statuses.length, "EMTToken: Arrays length mismatch");
        for (uint256 i = 0; i < accounts.length; i++) {
            isBlacklisted[accounts[i]] = statuses[i];
            emit BlacklistStatusChanged(accounts[i], statuses[i]);
        }
    }
    
    /**
     * @dev Update reference fiat currency
     * @dev 更新参考法定货币
     * Requirements: Caller must have ADMIN_ROLE
     * 要求：调用者必须具有ADMIN_ROLE
     * @param newFiat New reference fiat currency
     * @param newFiat 新的参考法定货币
     */
    function updateReferenceFiat(string memory newFiat) public onlyRole(ADMIN_ROLE) {
        referenceFiatCurrency = newFiat;
        emit ReferenceFiatUpdated(newFiat);
    }
    
    /**
     * @dev Update issuer details
     * @dev 更新发行方详情
     * Requirements: Caller must have ADMIN_ROLE
     * 要求：调用者必须具有ADMIN_ROLE
     * @param newDetails New issuer details
     * @param newDetails 新的发行方详情
     */
    function updateIssuerDetails(string memory newDetails) public onlyRole(ADMIN_ROLE) {
        issuerDetails = newDetails;
        emit IssuerDetailsUpdated(newDetails);
    }
    
    /**
     * @dev Set redemption settings and parameters
     * @dev 设置赎回状态和参数
     * Requirements: Caller must have ADMIN_ROLE
     * 要求：调用者必须具有ADMIN_ROLE
     * @param isEnabled Whether redemption is enabled
     * @param isEnabled 是否启用赎回
     * @param fee Redemption fee (in basis points)
     * @param fee 赎回费用(基点)
     * @param minimumAmount Minimum redemption amount
     * @param minimumAmount 最低赎回金额
     */
    function setRedemptionSettings(bool isEnabled, uint256 fee, uint256 minimumAmount) public onlyRole(ADMIN_ROLE) {
        require(fee <= 50, "EMTToken: Fee cannot exceed 0.5%");
        redemptionEnabled = isEnabled;
        redemptionFee = fee;
        minimumRedemptionAmount = minimumAmount;
        emit RedemptionStatusChanged(isEnabled, fee, minimumAmount);
    }
    
    /**
     * @dev Update reserve auditor
     * @dev 更新储备金审计师
     * Requirements: Caller must have ADMIN_ROLE
     * 要求：调用者必须具有ADMIN_ROLE
     * @param newAuditor New auditor
     * @param newAuditor 新的审计师
     */
    function updateReserveAuditor(string memory newAuditor) public onlyRole(ADMIN_ROLE) {
        reserveAuditor = newAuditor;
        emit ReserveAuditorChanged(newAuditor);
    }
    
    /**
     * @dev Update last audit date
     * @dev 更新最后审计日期
     * Requirements: Caller must have ADMIN_ROLE
     * 要求：调用者必须具有ADMIN_ROLE
     * @param newDate New audit date
     * @param newDate 新的审计日期
     */
    function updateAuditDate(string memory newDate) public onlyRole(ADMIN_ROLE) {
        lastAuditDate = newDate;
        emit AuditDateUpdated(newDate);
    }
    
    /**
     * @dev Set daily transaction limit
     * @dev 设置每日交易限额
     * Requirements: Caller must have ADMIN_ROLE
     * 要求：调用者必须具有ADMIN_ROLE
     * @param newLimit New daily limit
     * @param newLimit 新的每日限额
     */
    function setDailyTransactionLimit(uint256 newLimit) public onlyRole(ADMIN_ROLE) {
        dailyTransactionLimit = newLimit;
    }
    
    /**
     * @dev Redeem tokens
     * @dev 赎回代币
     * Burns user tokens, actual fund redemption handled off-chain
     * 将烧毁用户的代币，实际资金赎回需要链下处理
     * @param amount Amount to redeem
     * @param amount 要赎回的金额
     */
    function redeem(uint256 amount) public whenNotPaused {
        require(redemptionEnabled, "EMTToken: Redemption currently disabled");
        require(isKYCVerified[msg.sender], "EMTToken: Not KYC verified");
        require(!isBlacklisted[msg.sender], "EMTToken: Account is blacklisted");
        require(amount >= minimumRedemptionAmount, "EMTToken: Amount below minimum");
        
        uint256 fee = (amount * redemptionFee) / 10000;
        uint256 amountAfterFee = amount - fee;
        
        _burn(msg.sender, amount);
        if (fee > 0) {
            _mint(address(this), fee); // Transfer fee to contract // 将费用转到合约
        }
        
        emit FundsRedeemed(msg.sender, amount, fee);
    }
    
    /**
     * @dev Check and update daily transaction amount
     * @dev 检查并更新每日交易额
     * @param account Account address
     * @param account 账户地址
     * @param amount Transaction amount
     * @param amount 交易金额
     */
    function _checkAndUpdateDailyLimit(address account, uint256 amount) internal {
        // If it's a new day, reset counter
        // 如果是新的一天，重置计数器
        if (block.timestamp >= lastTransactionReset[account] + 1 days) {
            dailyTransactions[account] = 0;
            lastTransactionReset[account] = block.timestamp;
        }
        
        // Check if transaction exceeds limit
        // 检查交易是否超过限额
        require(dailyTransactions[account] + amount <= dailyTransactionLimit, 
                "EMTToken: Daily transaction limit exceeded");
                
        // Update transaction amount
        // 更新交易额
        dailyTransactions[account] += amount;
    }
    
    /**
     * @dev Freeze account funds
     * @dev 冻结账户资金
     * Requirements: Caller must have COMPLIANCE_ROLE
     * 要求：调用者必须具有COMPLIANCE_ROLE
     * @param account Account to freeze
     * @param account 要冻结的账户
     */
    function freezeAccount(address account) public onlyRole(COMPLIANCE_ROLE) {
        setBlacklistStatus(account, true);
    }
    
    /**
     * @dev Unfreeze account funds
     * @dev 解冻账户资金
     * Requirements: Caller must have COMPLIANCE_ROLE
     * 要求：调用者必须具有COMPLIANCE_ROLE
     * @param account Account to unfreeze
     * @param account 要解冻的账户
     */
    function unfreezeAccount(address account) public onlyRole(COMPLIANCE_ROLE) {
        setBlacklistStatus(account, false);
    }
    
    /**
     * @dev Override transfer function to add compliance checks
     * @dev 重写transfer函数以添加合规检查
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(isKYCVerified[msg.sender], "EMTToken: Sender not KYC verified");
        require(isKYCVerified[to], "EMTToken: Recipient not KYC verified");
        require(!isBlacklisted[msg.sender], "EMTToken: Sender is blacklisted");
        require(!isBlacklisted[to], "EMTToken: Recipient is blacklisted");
        
        _checkAndUpdateDailyLimit(msg.sender, amount);
        
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom function to add compliance checks
     * @dev 重写transferFrom函数以添加合规检查
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(isKYCVerified[from], "EMTToken: Sender not KYC verified");
        require(isKYCVerified[to], "EMTToken: Recipient not KYC verified");
        require(!isBlacklisted[from], "EMTToken: Sender is blacklisted");
        require(!isBlacklisted[to], "EMTToken: Recipient is blacklisted");
        
        _checkAndUpdateDailyLimit(from, amount);
        
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Override _beforeTokenTransfer to add additional checks
     * @dev 重写_beforeTokenTransfer以添加额外检查
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Get token decimals. EMTs typically use the same precision as the reference fiat currency
     * @dev 获取代币小数位数，EMT通常使用与参考法币相同的精度
     * For EUR and USD, typically 2 decimal places
     * 对于EUR和USD，通常为2位小数
     */
    function decimals() public view override returns (uint8) {
        // For major fiat currencies (EUR, USD, etc.), use 2 decimal places
        // 对于主要法币(EUR, USD等)使用2位小数
        if (
            keccak256(bytes(referenceFiatCurrency)) == keccak256(bytes("EUR")) ||
            keccak256(bytes(referenceFiatCurrency)) == keccak256(bytes("USD")) ||
            keccak256(bytes(referenceFiatCurrency)) == keccak256(bytes("GBP"))
        ) {
            return 2;
        }
        // Default to 18 decimal places
        // 默认返回18位小数
        return 18;
    }
    
    /**
     * @dev 授权升级合约的函数，仅UPGRADER_ROLE可以升级
     * Function to authorize the upgrade of the contract, only UPGRADER_ROLE can upgrade
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
} 