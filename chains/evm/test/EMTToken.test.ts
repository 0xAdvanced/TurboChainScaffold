import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { EMTToken } from "../typechain-types";

describe("EMTToken", function () {
  let emtToken: EMTToken;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let complianceOfficer: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let pauser: HardhatEthersSigner;
  let minter: HardhatEthersSigner;
  
  const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const COMPLIANCE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_ROLE"));
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const UPGRADER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UPGRADER_ROLE"));
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  
  const TOKEN_NAME = "Euro E-Money Token";
  const TOKEN_SYMBOL = "EEMT";
  const FIAT_CURRENCY = "EUR";
  const ISSUER_DETAILS = "European E-Money Issuer Ltd.";
  
  beforeEach(async function () {
    [owner, user1, user2, complianceOfficer, admin, pauser, minter] = await ethers.getSigners();
    
    const EMTTokenFactory = await ethers.getContractFactory("EMTToken");
    emtToken = await upgrades.deployProxy(
      EMTTokenFactory, 
      [TOKEN_NAME, TOKEN_SYMBOL, owner.address, FIAT_CURRENCY, ISSUER_DETAILS], 
      { 
        initializer: 'initialize',
        kind: 'uups'
      }
    ) as unknown as EMTToken;
    
    // 授予角色
    await emtToken.connect(owner).grantRole(COMPLIANCE_ROLE, complianceOfficer.address);
    await emtToken.connect(owner).grantRole(ADMIN_ROLE, admin.address);
    await emtToken.connect(owner).grantRole(PAUSER_ROLE, pauser.address);
    await emtToken.connect(owner).grantRole(MINTER_ROLE, minter.address);
    
    // 设置用户1为已KYC验证用户
    await emtToken.connect(complianceOfficer).setKYCStatus(user1.address, true);
  });
  
  describe("部署", function () {
    it("应该正确设置代币名称和符号", async function () {
      expect(await emtToken.name()).to.equal(TOKEN_NAME);
      expect(await emtToken.symbol()).to.equal(TOKEN_SYMBOL);
    });
    
    it("应该为创建者分配正确的角色", async function () {
      expect(await emtToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await emtToken.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
      expect(await emtToken.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await emtToken.hasRole(COMPLIANCE_ROLE, owner.address)).to.be.true;
      expect(await emtToken.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await emtToken.hasRole(UPGRADER_ROLE, owner.address)).to.be.true;
    });
    
    it("应该正确设置法币和发行方信息", async function () {
      expect(await emtToken.referenceFiatCurrency()).to.equal(FIAT_CURRENCY);
      expect(await emtToken.issuerDetails()).to.equal(ISSUER_DETAILS);
    });
    
    it("应该设置正确的小数位数", async function () {
      // 欧元应该是2位小数
      expect(await emtToken.decimals()).to.equal(2);
    });
    
    it("应该设置默认的赎回设置", async function () {
      expect(await emtToken.redemptionEnabled()).to.be.true;
      expect(await emtToken.redemptionFee()).to.equal(0); // EMT通常不收取赎回费用
      expect(await emtToken.minimumRedemptionAmount()).to.equal(10 * 10**2); // 10欧元，2位小数
    });
  });
  
  describe("角色和权限", function () {
    it("应该允许将角色分配给其他账户", async function () {
      expect(await emtToken.hasRole(COMPLIANCE_ROLE, complianceOfficer.address)).to.be.true;
      expect(await emtToken.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
      expect(await emtToken.hasRole(PAUSER_ROLE, pauser.address)).to.be.true;
      expect(await emtToken.hasRole(MINTER_ROLE, minter.address)).to.be.true;
    });
    
    it("应该拒绝没有相应角色的账户调用受限函数", async function () {
      await expect(emtToken.connect(user1).mint(user2.address, 10000))
        .to.be.revertedWithCustomError(emtToken, "AccessControlUnauthorizedAccount");
        
      await expect(emtToken.connect(user1).pause())
        .to.be.revertedWithCustomError(emtToken, "AccessControlUnauthorizedAccount");
        
      await expect(emtToken.connect(user1).setKYCStatus(user2.address, true))
        .to.be.revertedWithCustomError(emtToken, "AccessControlUnauthorizedAccount");
        
      await expect(emtToken.connect(user1).updateReferenceFiat("USD"))
        .to.be.revertedWithCustomError(emtToken, "AccessControlUnauthorizedAccount");
    });
  });
  
  describe("KYC和合规检查", function () {
    it("应该正确设置和查询KYC状态", async function () {
      expect(await emtToken.isKYCVerified(user1.address)).to.be.true;
      expect(await emtToken.isKYCVerified(user2.address)).to.be.false;
      
      await emtToken.connect(complianceOfficer).setKYCStatus(user2.address, true);
      expect(await emtToken.isKYCVerified(user2.address)).to.be.true;
    });
    
    it("应该支持批量设置KYC状态", async function () {
      const accounts = [user1.address, user2.address];
      const statuses = [false, true];
      
      await emtToken.connect(complianceOfficer).batchSetKYCStatus(accounts, statuses);
      
      expect(await emtToken.isKYCVerified(user1.address)).to.be.false;
      expect(await emtToken.isKYCVerified(user2.address)).to.be.true;
    });
    
    it("应该正确设置和查询黑名单状态", async function () {
      expect(await emtToken.isBlacklisted(user1.address)).to.be.false;
      
      await emtToken.connect(complianceOfficer).setBlacklistStatus(user1.address, true);
      expect(await emtToken.isBlacklisted(user1.address)).to.be.true;
    });
    
    it("应该支持冻结和解冻账户功能", async function () {
      await emtToken.connect(complianceOfficer).freezeAccount(user1.address);
      expect(await emtToken.isBlacklisted(user1.address)).to.be.true;
      
      await emtToken.connect(complianceOfficer).unfreezeAccount(user1.address);
      expect(await emtToken.isBlacklisted(user1.address)).to.be.false;
    });
  });
  
  describe("铸造和转账", function () {
    beforeEach(async function () {
      await emtToken.connect(complianceOfficer).setKYCStatus(user2.address, true);
      await emtToken.connect(minter).mint(user1.address, 100000); // 1000欧元，2位小数
    });
    
    it("应该允许铸造给KYC验证的账户", async function () {
      expect(await emtToken.balanceOf(user1.address)).to.equal(100000);
    });
    
    it("应该拒绝铸造给未KYC验证的账户", async function () {
      await emtToken.connect(complianceOfficer).setKYCStatus(user2.address, false);
      await expect(emtToken.connect(minter).mint(user2.address, 10000))
        .to.be.revertedWith("EMTToken: Recipient not KYC verified");
    });
    
    it("应该拒绝铸造给黑名单账户", async function () {
      await emtToken.connect(complianceOfficer).setBlacklistStatus(user2.address, true);
      await expect(emtToken.connect(minter).mint(user2.address, 10000))
        .to.be.revertedWith("EMTToken: Recipient is blacklisted");
    });
    
    it("应该允许在KYC验证账户之间转账", async function () {
      await emtToken.connect(user1).transfer(user2.address, 10000);
      expect(await emtToken.balanceOf(user2.address)).to.equal(10000);
    });
    
    it("应该拒绝向未KYC验证的账户转账", async function () {
      await emtToken.connect(complianceOfficer).setKYCStatus(user2.address, false);
      await expect(emtToken.connect(user1).transfer(user2.address, 10000))
        .to.be.revertedWith("EMTToken: Recipient not KYC verified");
    });
    
    it("应该拒绝黑名单账户转账", async function () {
      await emtToken.connect(complianceOfficer).setBlacklistStatus(user1.address, true);
      await expect(emtToken.connect(user1).transfer(user2.address, 10000))
        .to.be.revertedWith("EMTToken: Sender is blacklisted");
    });
  });
  
  describe("每日交易限额", function () {
    beforeEach(async function () {
      await emtToken.connect(complianceOfficer).setKYCStatus(user2.address, true);
      await emtToken.connect(minter).mint(user1.address, 1000000); // 10000欧元，2位小数
      
      // 设置每日交易限额为5000欧元
      await emtToken.connect(admin).setDailyTransactionLimit(500000);
    });
    
    it("应该允许在每日限额内的交易", async function () {
      // 转账4000欧元
      await emtToken.connect(user1).transfer(user2.address, 400000);
      
      // 检查余额
      expect(await emtToken.balanceOf(user2.address)).to.equal(400000);
      
      // 再转账1000欧元，仍在限额内
      await emtToken.connect(user1).transfer(user2.address, 100000);
      expect(await emtToken.balanceOf(user2.address)).to.equal(500000);
    });
    
    it("应该拒绝超出每日限额的交易", async function () {
      // 先转账5000欧元，达到限额
      await emtToken.connect(user1).transfer(user2.address, 500000);
      
      // 再尝试转账，应该被拒绝
      await expect(emtToken.connect(user1).transfer(user2.address, 1))
        .to.be.revertedWith("EMTToken: Daily transaction limit exceeded");
    });
  });
  
  describe("管理员功能", function () {
    it("应该允许更新参考法定货币", async function () {
      expect(await emtToken.referenceFiatCurrency()).to.equal("EUR");
      
      await emtToken.connect(admin).updateReferenceFiat("USD");
      
      expect(await emtToken.referenceFiatCurrency()).to.equal("USD");
      // 更改法币后小数位数也应相应改变
      expect(await emtToken.decimals()).to.equal(2); // USD同样是2位小数
    });
    
    it("应该允许更新发行方详情", async function () {
      const newDetails = "Updated Issuer Details";
      await emtToken.connect(admin).updateIssuerDetails(newDetails);
      
      expect(await emtToken.issuerDetails()).to.equal(newDetails);
    });
    
    it("应该允许设置赎回参数", async function () {
      // 禁用赎回，设置少量费用，提高最低赎回金额
      await emtToken.connect(admin).setRedemptionSettings(false, 30, 50000);
      
      expect(await emtToken.redemptionEnabled()).to.be.false;
      expect(await emtToken.redemptionFee()).to.equal(30); // 0.3%
      expect(await emtToken.minimumRedemptionAmount()).to.equal(50000); // 500欧元
      
      // 不应允许超过0.5%的费用
      await expect(emtToken.connect(admin).setRedemptionSettings(true, 60, 10000))
        .to.be.revertedWith("EMTToken: Fee cannot exceed 0.5%");
    });
    
    it("应该允许更新储备审计信息", async function () {
      const newAuditor = "PwC";
      const newDate = "2023-12-31";
      
      await emtToken.connect(admin).updateReserveAuditor(newAuditor);
      await emtToken.connect(admin).updateAuditDate(newDate);
      
      expect(await emtToken.reserveAuditor()).to.equal(newAuditor);
      expect(await emtToken.lastAuditDate()).to.equal(newDate);
    });
  });
  
  describe("赎回机制", function () {
    beforeEach(async function () {
      await emtToken.connect(minter).mint(user1.address, 1000000); // 10000欧元，2位小数
    });
    
    it("应该允许KYC验证用户赎回代币", async function () {
      const initialBalance = await emtToken.balanceOf(user1.address);
      await emtToken.connect(user1).redeem(20000); // 赎回200欧元
      
      // 检查余额 (无费用)
      expect(await emtToken.balanceOf(user1.address)).to.equal(initialBalance - 20000n);
    });
    
    it("应该拒绝低于最低赎回金额的赎回", async function () {
      await expect(emtToken.connect(user1).redeem(500)) // 5欧元，低于最低赎回金额
        .to.be.revertedWith("EMTToken: Amount below minimum");
    });
    
    it("应该拒绝未KYC验证用户赎回", async function () {
      await emtToken.connect(complianceOfficer).setKYCStatus(user1.address, false);
      await expect(emtToken.connect(user1).redeem(20000))
        .to.be.revertedWith("EMTToken: Not KYC verified");
    });
    
    it("应该拒绝黑名单用户赎回", async function () {
      await emtToken.connect(complianceOfficer).setBlacklistStatus(user1.address, true);
      await expect(emtToken.connect(user1).redeem(20000))
        .to.be.revertedWith("EMTToken: Account is blacklisted");
    });
    
    it("应该在赎回禁用时拒绝赎回", async function () {
      await emtToken.connect(admin).setRedemptionSettings(false, 0, 1000);
      await expect(emtToken.connect(user1).redeem(20000))
        .to.be.revertedWith("EMTToken: Redemption currently disabled");
    });
    
    it("应该正确处理带有费用的赎回", async function () {
      // 设置0.3%的赎回费
      await emtToken.connect(admin).setRedemptionSettings(true, 30, 1000);
      
      const initialBalance = await emtToken.balanceOf(user1.address);
      await emtToken.connect(user1).redeem(100000); // 赎回1000欧元
      
      // 费用应该是3欧元 (0.3%的1000欧元)
      expect(await emtToken.balanceOf(user1.address)).to.equal(initialBalance - 100000n);
      expect(await emtToken.balanceOf(await emtToken.getAddress())).to.equal(30); // 3欧元费用
    });
  });
  
  describe("暂停功能", function () {
    beforeEach(async function () {
      await emtToken.connect(complianceOfficer).setKYCStatus(user2.address, true);
      await emtToken.connect(minter).mint(user1.address, 100000); // 1000欧元
    });
    
    it("应该允许暂停和恢复合约", async function () {
      // 暂停合约
      await emtToken.connect(pauser).pause();
      
      // 尝试转账
      await expect(emtToken.connect(user1).transfer(user2.address, 10000))
        .to.be.revertedWith("Pausable: paused");
        
      // 尝试赎回
      await expect(emtToken.connect(user1).redeem(10000))
        .to.be.revertedWith("Pausable: paused");
        
      // 恢复合约
      await emtToken.connect(pauser).unpause();
      
      // 现在应该可以转账了
      await emtToken.connect(user1).transfer(user2.address, 10000);
      expect(await emtToken.balanceOf(user2.address)).to.equal(10000);
    });
  });
  
  describe("升级机制", function () {
    it("应该允许升级合约", async function () {
      // 部署升级版本的合约
      const EMTTokenV2Factory = await ethers.getContractFactory("EMTToken"); // 实际项目中会部署V2版本
      const emtTokenV2 = await upgrades.upgradeProxy(await emtToken.getAddress(), EMTTokenV2Factory);
      
      // 验证升级后的合约保留了状态
      expect(await emtTokenV2.name()).to.equal(TOKEN_NAME);
      expect(await emtTokenV2.symbol()).to.equal(TOKEN_SYMBOL);
      expect(await emtTokenV2.referenceFiatCurrency()).to.equal(FIAT_CURRENCY);
      expect(await emtTokenV2.hasRole(UPGRADER_ROLE, owner.address)).to.be.true;
    });
    
    it("应该拒绝未授权账户升级合约", async function () {
      // 使用没有UPGRADER_ROLE的账户尝试升级
      const EMTTokenV2Factory = await ethers.getContractFactory("EMTToken", user1);
      
      // 这应该失败，因为user1没有UPGRADER_ROLE
      await expect(upgrades.upgradeProxy(await emtToken.getAddress(), EMTTokenV2Factory))
        .to.be.reverted;
    });
  });
}); 