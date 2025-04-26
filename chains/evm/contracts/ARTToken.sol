// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title ARTToken - 资产参考型代币
 * @dev An Asset-Referenced Token (ART) that is backed by a basket of assets
 * 一种由多种资产支持的资产参考型代币
 */
contract ARTToken is 
    Initializable, 
    ERC20Upgradeable, 
    ERC20BurnableUpgradeable, 
    PausableUpgradeable, 
    AccessControlUpgradeable,
    UUPSUpgradeable 
{
    // 角色定义 / Role definitions
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant ASSET_MANAGER_ROLE = keccak256("ASSET_MANAGER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // KYC/AML合规检查映射 / KYC/AML compliance mapping
    mapping(address => bool) public isCompliant;
    
    // 黑名单 / Blacklist
    mapping(address => bool) public isBlacklisted;
    
    // 储备资产信息 / Reserve asset information
    struct AssetReserve {
        string name;      // 资产名称 / Name of the asset
        uint256 amount;   // 资产数量 / Amount of the asset
        uint256 value;    // 资产价值(以基础货币计) / Value in base currency
        uint256 timestamp; // 最后更新时间 / Last update timestamp
    }
    
    // 储备资产列表 / List of reserve assets
    AssetReserve[] public reserves;
    
    // 总储备价值 / Total reserve value
    uint256 public totalReserveValue;
    
    // 赎回费率（以基点表示，1% = 100 基点） / Redemption fee in basis points (1% = 100 bp)
    uint256 public redemptionFee; 
    
    // 最低赎回金额 / Minimum redemption amount
    uint256 public minRedemptionAmount;
    
    // 事件定义 / Event definitions
    event ComplianceStatusChanged(address indexed account, bool status);
    event BlacklistStatusChanged(address indexed account, bool status);
    event ReserveUpdated(uint256 reserveIndex, string name, uint256 amount, uint256 value);
    event ReserveAdded(uint256 reserveIndex, string name, uint256 amount, uint256 value);
    event ReserveRemoved(uint256 reserveIndex);
    event RedemptionFeeChanged(uint256 oldFee, uint256 newFee);
    event TokensRedeemed(address indexed redeemer, uint256 amount, uint256 fee);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev 初始化函数，设置代币名称、符号、初始角色和储备资产
     * Initializes the contract by setting token name, symbol, initial roles, and reserve assets
     * @param name 代币名称 / Token name
     * @param symbol 代币符号 / Token symbol
     * @param initialAdmin 初始管理员地址 / Initial admin address
     */
    function initialize(
        string memory name, 
        string memory symbol,
        address initialAdmin
    ) public initializer {
        __ERC20_init(name, symbol);
        __ERC20Burnable_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(PAUSER_ROLE, initialAdmin);
        _grantRole(MINTER_ROLE, initialAdmin);
        _grantRole(COMPLIANCE_ROLE, initialAdmin);
        _grantRole(ASSET_MANAGER_ROLE, initialAdmin);
        _grantRole(UPGRADER_ROLE, initialAdmin);
        
        // 默认赎回费率0.5% / Default redemption fee 0.5%
        redemptionFee = 50;
        
        // 默认最低赎回金额100个代币 / Default minimum redemption amount 100 tokens
        minRedemptionAmount = 100 * 10**18;
    }

    /**
     * @dev 暂停所有代币转移
     * Pause all token transfers
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev 恢复所有代币转移
     * Unpause all token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev 铸造新代币
     * Mint new tokens
     * @param to 接收代币的地址 / Address to receive tokens
     * @param amount 铸造的代币数量 / Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(isCompliant[to], "ARTToken: recipient not compliant");
        require(!isBlacklisted[to], "ARTToken: recipient is blacklisted");
        _mint(to, amount);
    }

    /**
     * @dev 设置账户的合规状态
     * Set compliance status for an account
     * @param account 要设置的账户地址 / Account address to set status for
     * @param status 合规状态 / Compliance status
     */
    function setComplianceStatus(address account, bool status) public onlyRole(COMPLIANCE_ROLE) {
        isCompliant[account] = status;
        emit ComplianceStatusChanged(account, status);
    }

    /**
     * @dev 设置账户的黑名单状态
     * Set blacklist status for an account
     * @param account 要设置的账户地址 / Account address to set status for
     * @param status 黑名单状态 / Blacklist status
     */
    function setBlacklistStatus(address account, bool status) public onlyRole(COMPLIANCE_ROLE) {
        isBlacklisted[account] = status;
        emit BlacklistStatusChanged(account, status);
    }

    /**
     * @dev 批量设置账户的合规状态
     * Set compliance status for multiple accounts
     * @param accounts 账户地址数组 / Array of account addresses
     * @param statuses 状态数组 / Array of statuses
     */
    function batchSetComplianceStatus(address[] calldata accounts, bool[] calldata statuses) 
        public onlyRole(COMPLIANCE_ROLE) 
    {
        require(accounts.length == statuses.length, "ARTToken: arrays length mismatch");
        for (uint256 i = 0; i < accounts.length; i++) {
            isCompliant[accounts[i]] = statuses[i];
            emit ComplianceStatusChanged(accounts[i], statuses[i]);
        }
    }

    /**
     * @dev 添加储备资产
     * Add a reserve asset
     * @param name 资产名称 / Asset name
     * @param amount 资产数量 / Asset amount
     * @param value 资产价值 / Asset value
     */
    function addReserveAsset(string calldata name, uint256 amount, uint256 value) 
        public onlyRole(ASSET_MANAGER_ROLE) 
    {
        reserves.push(AssetReserve(name, amount, value, block.timestamp));
        totalReserveValue += value;
        emit ReserveAdded(reserves.length - 1, name, amount, value);
    }

    /**
     * @dev 更新储备资产
     * Update a reserve asset
     * @param index 资产索引 / Asset index
     * @param amount 新的资产数量 / New asset amount
     * @param value 新的资产价值 / New asset value
     */
    function updateReserveAsset(uint256 index, uint256 amount, uint256 value) 
        public onlyRole(ASSET_MANAGER_ROLE) 
    {
        require(index < reserves.length, "ARTToken: invalid reserve index");
        
        totalReserveValue = totalReserveValue - reserves[index].value + value;
        
        reserves[index].amount = amount;
        reserves[index].value = value;
        reserves[index].timestamp = block.timestamp;
        
        emit ReserveUpdated(index, reserves[index].name, amount, value);
    }

    /**
     * @dev 移除储备资产
     * Remove a reserve asset
     * @param index 资产索引 / Asset index
     */
    function removeReserveAsset(uint256 index) public onlyRole(ASSET_MANAGER_ROLE) {
        require(index < reserves.length, "ARTToken: invalid reserve index");
        
        totalReserveValue -= reserves[index].value;
        
        // 如果不是最后一个元素，则用最后一个元素替换要删除的元素
        // If not the last element, replace with the last element
        if (index != reserves.length - 1) {
            reserves[index] = reserves[reserves.length - 1];
        }
        
        reserves.pop();
        emit ReserveRemoved(index);
    }

    /**
     * @dev 设置赎回费率
     * Set redemption fee
     * @param newFee 新的费率（以基点表示） / New fee in basis points
     */
    function setRedemptionFee(uint256 newFee) public onlyRole(ASSET_MANAGER_ROLE) {
        require(newFee <= 500, "ARTToken: fee too high"); // 最高5% / Max 5%
        uint256 oldFee = redemptionFee;
        redemptionFee = newFee;
        emit RedemptionFeeChanged(oldFee, newFee);
    }

    /**
     * @dev 设置最低赎回金额
     * Set minimum redemption amount
     * @param amount 新的最低赎回金额 / New minimum redemption amount
     */
    function setMinRedemptionAmount(uint256 amount) public onlyRole(ASSET_MANAGER_ROLE) {
        minRedemptionAmount = amount;
    }

    /**
     * @dev 赎回代币
     * Redeem tokens
     * @param amount 要赎回的代币数量 / Amount of tokens to redeem
     */
    function redeem(uint256 amount) public whenNotPaused {
        require(amount >= minRedemptionAmount, "ARTToken: amount below minimum");
        require(isCompliant[msg.sender], "ARTToken: not compliant");
        require(!isBlacklisted[msg.sender], "ARTToken: blacklisted");
        
        uint256 fee = (amount * redemptionFee) / 10000;
        uint256 netAmount = amount - fee;
        
        _burn(msg.sender, amount);
        
        if (fee > 0) {
            // 将费用转移给国库或处理费用的逻辑
            // Logic to transfer fees to treasury or process fees
        }
        
        emit TokensRedeemed(msg.sender, amount, fee);
        
        // 实际赎回处理逻辑（例如触发法币转账）应在链下完成
        // Actual redemption processing (e.g., triggering fiat transfer) should be done off-chain
    }

    /**
     * @dev 获取储备资产数量
     * Get the number of reserve assets
     * @return 储备资产数量 / Number of reserve assets
     */
    function getReserveCount() public view returns (uint256) {
        return reserves.length;
    }

    /**
     * @dev 获取特定储备资产信息
     * Get specific reserve asset information
     * @param index 资产索引 / Asset index
     * @return 资产名称、数量、价值和时间戳 / Asset name, amount, value and timestamp
     */
    function getReserveInfo(uint256 index) public view returns (string memory, uint256, uint256, uint256) {
        require(index < reserves.length, "ARTToken: invalid reserve index");
        AssetReserve memory reserve = reserves[index];
        return (reserve.name, reserve.amount, reserve.value, reserve.timestamp);
    }

    /**
     * @dev 获取储备率信息
     * Get reserve ratio information
     * @return 储备率（以百分比表示） / Reserve ratio in percentage
     */
    function getReserveRatio() public view returns (uint256) {
        uint256 totalSupplyValue = totalSupply();
        if (totalSupplyValue == 0) return 0;
        
        // 如果总供应量不是18位小数，则需要进行调整
        // Need to adjust if total supply is not 18 decimals
        
        return (totalReserveValue * 100 * 10**18) / totalSupplyValue;
    }

    /**
     * @dev 在转移代币前进行检查
     * Check before token transfer
     * @param from 发送方地址 / Sender address
     * @param to 接收方地址 / Recipient address
     * @param amount 转移金额 / Transfer amount
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
        whenNotPaused
    {
        if (from != address(0) && to != address(0)) { // 跳过铸造和销毁 / Skip minting and burning
            require(!isBlacklisted[from], "ARTToken: sender is blacklisted");
            require(!isBlacklisted[to], "ARTToken: recipient is blacklisted");
            require(isCompliant[to], "ARTToken: recipient not compliant");
        }
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev 授权升级合约的函数，仅UPGRADER_ROLE可以升级
     * Function to authorize the upgrade of the contract, only UPGRADER_ROLE can upgrade
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
} 