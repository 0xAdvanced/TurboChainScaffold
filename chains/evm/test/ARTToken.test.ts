import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ARTToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ARTToken", function () {
  let artToken: ARTToken;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let complianceOfficer: HardhatEthersSigner;
  let assetManager: HardhatEthersSigner;
  let pauser: HardhatEthersSigner;
  let minter: HardhatEthersSigner;
  
  const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const COMPLIANCE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_ROLE"));
  const ASSET_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ASSET_MANAGER_ROLE"));
  const UPGRADER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UPGRADER_ROLE"));
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  
  const TOKEN_NAME = "Asset Referenced Token";
  const TOKEN_SYMBOL = "ART";
  
  beforeEach(async function () {
    [owner, user1, user2, complianceOfficer, assetManager, pauser, minter] = await ethers.getSigners();
    
    const ARTTokenFactory = await ethers.getContractFactory("ARTToken");
    artToken = await upgrades.deployProxy(ARTTokenFactory, [TOKEN_NAME, TOKEN_SYMBOL, owner.address], { 
      initializer: 'initialize',
      kind: 'uups'
    }) as unknown as ARTToken;
    
    // 授予角色
    await artToken.connect(owner).grantRole(COMPLIANCE_ROLE, complianceOfficer.address);
    await artToken.connect(owner).grantRole(ASSET_MANAGER_ROLE, assetManager.address);
    await artToken.connect(owner).grantRole(PAUSER_ROLE, pauser.address);
    await artToken.connect(owner).grantRole(MINTER_ROLE, minter.address);
    
    // 设置用户1为合规用户
    await artToken.connect(complianceOfficer).setComplianceStatus(user1.address, true);
  });
  
  describe("部署", function () {
    it("应该正确设置代币名称和符号", async function () {
      expect(await artToken.name()).to.equal(TOKEN_NAME);
      expect(await artToken.symbol()).to.equal(TOKEN_SYMBOL);
    });
    
    it("应该为创建者分配正确的角色", async function () {
      expect(await artToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await artToken.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
      expect(await artToken.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await artToken.hasRole(COMPLIANCE_ROLE, owner.address)).to.be.true;
      expect(await artToken.hasRole(ASSET_MANAGER_ROLE, owner.address)).to.be.true;
      expect(await artToken.hasRole(UPGRADER_ROLE, owner.address)).to.be.true;
    });
    
    it("应该设置默认的赎回设置", async function () {
      expect(await artToken.redemptionFee()).to.equal(50); // 0.5%
      expect(await artToken.minRedemptionAmount()).to.equal(ethers.parseEther("100"));
    });
  });
  
  describe("角色和权限", function () {
    it("应该允许将角色分配给其他账户", async function () {
      expect(await artToken.hasRole(COMPLIANCE_ROLE, complianceOfficer.address)).to.be.true;
      expect(await artToken.hasRole(ASSET_MANAGER_ROLE, assetManager.address)).to.be.true;
      expect(await artToken.hasRole(PAUSER_ROLE, pauser.address)).to.be.true;
      expect(await artToken.hasRole(MINTER_ROLE, minter.address)).to.be.true;
    });
    
    it("应该拒绝没有相应角色的账户调用受限函数", async function () {
      await expect(artToken.connect(user1).mint(user2.address, ethers.parseEther("100")))
        .to.be.revertedWithCustomError(artToken, "AccessControlUnauthorizedAccount");
        
      await expect(artToken.connect(user1).pause())
        .to.be.revertedWithCustomError(artToken, "AccessControlUnauthorizedAccount");
        
      await expect(artToken.connect(user1).setComplianceStatus(user2.address, true))
        .to.be.revertedWithCustomError(artToken, "AccessControlUnauthorizedAccount");
        
      await expect(artToken.connect(user1).addReserveAsset("Test Asset", 1000, 1000))
        .to.be.revertedWithCustomError(artToken, "AccessControlUnauthorizedAccount");
    });
  });
  
  describe("合规检查", function () {
    it("应该正确设置和查询合规状态", async function () {
      expect(await artToken.isCompliant(user1.address)).to.be.true;
      expect(await artToken.isCompliant(user2.address)).to.be.false;
      
      await artToken.connect(complianceOfficer).setComplianceStatus(user2.address, true);
      expect(await artToken.isCompliant(user2.address)).to.be.true;
    });
    
    it("应该支持批量设置合规状态", async function () {
      const accounts = [user1.address, user2.address];
      const statuses = [false, true];
      
      await artToken.connect(complianceOfficer).batchSetComplianceStatus(accounts, statuses);
      
      expect(await artToken.isCompliant(user1.address)).to.be.false;
      expect(await artToken.isCompliant(user2.address)).to.be.true;
    });
    
    it("应该正确设置和查询黑名单状态", async function () {
      expect(await artToken.isBlacklisted(user1.address)).to.be.false;
      
      await artToken.connect(complianceOfficer).setBlacklistStatus(user1.address, true);
      expect(await artToken.isBlacklisted(user1.address)).to.be.true;
    });
  });
  
  describe("铸造和转账", function () {
    beforeEach(async function () {
      await artToken.connect(complianceOfficer).setComplianceStatus(user2.address, true);
      await artToken.connect(minter).mint(user1.address, ethers.parseEther("1000"));
    });
    
    it("应该允许铸造给合规账户", async function () {
      expect(await artToken.balanceOf(user1.address)).to.equal(ethers.parseEther("1000"));
    });
    
    it("应该拒绝铸造给非合规账户", async function () {
      await artToken.connect(complianceOfficer).setComplianceStatus(user2.address, false);
      await expect(artToken.connect(minter).mint(user2.address, ethers.parseEther("100")))
        .to.be.revertedWith("ARTToken: recipient not compliant");
    });
    
    it("应该拒绝铸造给黑名单账户", async function () {
      await artToken.connect(complianceOfficer).setBlacklistStatus(user2.address, true);
      await expect(artToken.connect(minter).mint(user2.address, ethers.parseEther("100")))
        .to.be.revertedWith("ARTToken: recipient is blacklisted");
    });
    
    it("应该允许在合规账户之间转账", async function () {
      await artToken.connect(user1).transfer(user2.address, ethers.parseEther("100"));
      expect(await artToken.balanceOf(user2.address)).to.equal(ethers.parseEther("100"));
    });
    
    it("应该拒绝向非合规账户转账", async function () {
      await artToken.connect(complianceOfficer).setComplianceStatus(user2.address, false);
      await expect(artToken.connect(user1).transfer(user2.address, ethers.parseEther("100")))
        .to.be.revertedWith("ARTToken: recipient not compliant");
    });
    
    it("应该拒绝黑名单账户转账", async function () {
      await artToken.connect(complianceOfficer).setBlacklistStatus(user1.address, true);
      await expect(artToken.connect(user1).transfer(user2.address, ethers.parseEther("100")))
        .to.be.revertedWith("ARTToken: sender is blacklisted");
    });
  });
  
  describe("储备资产管理", function () {
    it("应该允许添加储备资产", async function () {
      await artToken.connect(assetManager).addReserveAsset("USD", 1000000, ethers.parseEther("1000000"));
      
      expect(await artToken.getReserveCount()).to.equal(1);
      expect(await artToken.totalReserveValue()).to.equal(ethers.parseEther("1000000"));
      
      const [name, amount, value] = await artToken.getReserveInfo(0);
      expect(name).to.equal("USD");
      expect(amount).to.equal(1000000);
      expect(value).to.equal(ethers.parseEther("1000000"));
    });
    
    it("应该允许更新储备资产", async function () {
      await artToken.connect(assetManager).addReserveAsset("USD", 1000000, ethers.parseEther("1000000"));
      await artToken.connect(assetManager).updateReserveAsset(0, 1500000, ethers.parseEther("1500000"));
      
      expect(await artToken.totalReserveValue()).to.equal(ethers.parseEther("1500000"));
      
      const [name, amount, value] = await artToken.getReserveInfo(0);
      expect(name).to.equal("USD");
      expect(amount).to.equal(1500000);
      expect(value).to.equal(ethers.parseEther("1500000"));
    });
    
    it("应该允许移除储备资产", async function () {
      await artToken.connect(assetManager).addReserveAsset("USD", 1000000, ethers.parseEther("1000000"));
      await artToken.connect(assetManager).addReserveAsset("EUR", 800000, ethers.parseEther("900000"));
      
      expect(await artToken.getReserveCount()).to.equal(2);
      expect(await artToken.totalReserveValue()).to.equal(ethers.parseEther("1900000"));
      
      await artToken.connect(assetManager).removeReserveAsset(0);
      
      expect(await artToken.getReserveCount()).to.equal(1);
      expect(await artToken.totalReserveValue()).to.equal(ethers.parseEther("900000"));
      
      const [name, amount, value] = await artToken.getReserveInfo(0);
      expect(name).to.equal("EUR");
    });
    
    it("应该计算正确的储备率", async function () {
      // 添加储备
      await artToken.connect(assetManager).addReserveAsset("USD", 1000000, ethers.parseEther("1000000"));
      
      // 铸造代币
      await artToken.connect(complianceOfficer).setComplianceStatus(user1.address, true);
      await artToken.connect(minter).mint(user1.address, ethers.parseEther("500000"));
      
      // 计算储备率 (100 * 10^18 * 1000000 / 500000)
      const expectedRatio = 20000n * 10n**16n; // 200%
      expect(await artToken.getReserveRatio()).to.equal(expectedRatio);
    });
  });
  
  describe("赎回机制", function () {
    beforeEach(async function () {
      await artToken.connect(complianceOfficer).setComplianceStatus(user1.address, true);
      await artToken.connect(minter).mint(user1.address, ethers.parseEther("1000"));
    });
    
    it("应该允许合规用户赎回代币", async function () {
      const initialBalance = await artToken.balanceOf(user1.address);
      await artToken.connect(user1).redeem(ethers.parseEther("200"));
      
      // 检查余额 (扣除0.5%费用)
      expect(await artToken.balanceOf(user1.address)).to.equal(initialBalance - ethers.parseEther("200"));
    });
    
    it("应该拒绝低于最低赎回金额的赎回", async function () {
      await expect(artToken.connect(user1).redeem(ethers.parseEther("50")))
        .to.be.revertedWith("ARTToken: amount below minimum");
    });
    
    it("应该拒绝非合规用户赎回", async function () {
      await artToken.connect(complianceOfficer).setComplianceStatus(user1.address, false);
      await expect(artToken.connect(user1).redeem(ethers.parseEther("200")))
        .to.be.revertedWith("ARTToken: not compliant");
    });
    
    it("应该拒绝黑名单用户赎回", async function () {
      await artToken.connect(complianceOfficer).setBlacklistStatus(user1.address, true);
      await expect(artToken.connect(user1).redeem(ethers.parseEther("200")))
        .to.be.revertedWith("ARTToken: blacklisted");
    });
    
    it("应该允许更新赎回费率", async function () {
      expect(await artToken.redemptionFee()).to.equal(50); // 0.5%
      
      await artToken.connect(assetManager).setRedemptionFee(100); // 1%
      expect(await artToken.redemptionFee()).to.equal(100);
      
      // 尝试设置过高的费率
      await expect(artToken.connect(assetManager).setRedemptionFee(600))
        .to.be.revertedWith("ARTToken: fee too high");
    });
    
    it("应该允许更新最低赎回金额", async function () {
      await artToken.connect(assetManager).setMinRedemptionAmount(ethers.parseEther("50"));
      expect(await artToken.minRedemptionAmount()).to.equal(ethers.parseEther("50"));
      
      // 测试新的最低赎回金额
      await artToken.connect(user1).redeem(ethers.parseEther("50"));
    });
  });
  
  describe("暂停功能", function () {
    beforeEach(async function () {
      await artToken.connect(complianceOfficer).setComplianceStatus(user1.address, true);
      await artToken.connect(complianceOfficer).setComplianceStatus(user2.address, true);
      await artToken.connect(minter).mint(user1.address, ethers.parseEther("1000"));
    });
    
    it("应该允许暂停和恢复合约", async function () {
      // 暂停合约
      await artToken.connect(pauser).pause();
      
      // 尝试转账
      await expect(artToken.connect(user1).transfer(user2.address, ethers.parseEther("100")))
        .to.be.revertedWith("Pausable: paused");
        
      // 尝试赎回
      await expect(artToken.connect(user1).redeem(ethers.parseEther("100")))
        .to.be.revertedWith("Pausable: paused");
        
      // 恢复合约
      await artToken.connect(pauser).unpause();
      
      // 现在应该可以转账了
      await artToken.connect(user1).transfer(user2.address, ethers.parseEther("100"));
      expect(await artToken.balanceOf(user2.address)).to.equal(ethers.parseEther("100"));
    });
  });
  
  describe("升级机制", function () {
    it("应该允许升级合约", async function () {
      // 部署升级版本的合约
      const ARTTokenV2Factory = await ethers.getContractFactory("ARTToken"); // 实际项目中会部署V2版本
      const artTokenV2 = await upgrades.upgradeProxy(await artToken.getAddress(), ARTTokenV2Factory);
      
      // 验证升级后的合约保留了状态
      expect(await artTokenV2.name()).to.equal(TOKEN_NAME);
      expect(await artTokenV2.symbol()).to.equal(TOKEN_SYMBOL);
      expect(await artTokenV2.hasRole(UPGRADER_ROLE, owner.address)).to.be.true;
    });
    
    it("应该拒绝未授权账户升级合约", async function () {
      // 使用没有UPGRADER_ROLE的账户尝试升级
      const ARTTokenV2Factory = await ethers.getContractFactory("ARTToken", user1);
      
      // 这应该失败，因为user1没有UPGRADER_ROLE
      await expect(upgrades.upgradeProxy(await artToken.getAddress(), ARTTokenV2Factory))
        .to.be.reverted;
    });
  });
}); 