# MICA框架及其加密资产类型

## 目录
- [概述](#概述)
- [资产参考型代币(ART)](#资产参考型代币art)
  - [定义和特点](#art定义和特点)
  - [监管要求](#art监管要求)
  - [市场上的实例](#art市场上的实例)
  - [我们的实现](#art实现参考)
- [电子货币代币(EMT)](#电子货币代币emt)
  - [定义和特点](#emt定义和特点)
  - [监管要求](#emt监管要求)
  - [市场上的实例](#emt市场上的实例)
  - [我们的实现](#emt实现参考)
- [MICA合规性核查清单](#mica合规性核查清单)
- [参考资料](#参考资料)

## 概述

欧盟的《加密资产市场条例》(Markets in Crypto-Assets, MICA) 是一个全面的监管框架，于2023年通过并将在2024年全面生效，旨在规范加密资产市场，保护投资者并促进创新。MICA框架将加密资产分为三类：

1. **资产参考型代币(Asset-Referenced Tokens, ARTs)**：价值与一篮子法定货币、一种或多种商品或其他加密资产挂钩的代币
2. **电子货币代币(E-Money Tokens, EMTs)**：价值与单一法定货币挂钩的代币
3. **其他加密资产(Other Crypto-Assets)**：不属于上述两类的加密资产，如非同质化代币(NFTs)、功能型代币等

本文主要关注前两类加密资产：ARTs和EMTs，它们是稳定币的两种主要类型，各有不同的特点和监管要求。

## 资产参考型代币(ART)

### ART定义和特点

资产参考型代币(ART)是一种稳定币，其价值与多种资产挂钩，这些资产可以是：
- 多种法定货币（如一篮子法定货币）
- 一种或多种商品（如黄金、石油等）
- 一种或多种加密资产
- 上述资产的组合

ART的主要特点包括：
- 可以与多种资产挂钩，而不仅限于单一法定货币
- 有更灵活的储备组合
- 可以设计为适应特定市场需求的稳定币

### ART监管要求

根据MICA框架，ART发行者必须遵守以下监管要求：

1. **发行者授权**：ART发行者必须获得授权并且是注册在欧盟内的法人实体
2. **白皮书要求**：发布详细的白皮书，披露ART的特性、权利义务、底层技术、风险等
3. **资本要求**：维持至少35万欧元或总储备资产价值的2%（取较高者）的自有资金
4. **储备资产管理**：
   - 必须维持100%的储备，其价值至少等于流通中的ART
   - 储备资产必须隔离并保护，不受发行者破产影响
   - 储备资产必须投资于安全、低风险的工具
5. **赎回权利**：持有人必须能够随时以面值赎回ART
6. **治理和控制**：建立稳健的治理安排、内部控制和风险管理框架
7. **防止利益冲突**：实施政策和程序，防止潜在的利益冲突
8. **透明度**：定期公开储备资产的组成、数量和价值

### ART市场上的实例

目前市场上与ART概念相似的代币包括：

1. **Libra/Diem (已停止)**：Meta(前Facebook)计划的稳定币，原计划与一篮子法定货币挂钩，后调整策略
2. **XSGD/XIDR**：由新加坡企业Xfers发行的稳定币
3. **MakerDAO的DAI**：虽然DAI目标是与美元保持一对一锚定，但它使用多种加密资产作为担保
4. **FRAX**：部分抵押和算法混合设计的稳定币
5. **VALE**：多货币锚定的稳定币，与一篮子法定货币挂钩

### ART实现参考

我们的实现已经包含了满足MICA监管要求的核心功能，见 [ARTToken.sol](../contracts/ARTToken.sol)。

关键功能包括：
- KYC/AML合规检查系统
- 参考资产和储备组成的透明度
- 赎回机制
- 灵活的治理架构
- 储备资产审计
- 交易限制和合规控制

## 电子货币代币(EMT)

### EMT定义和特点

电子货币代币(EMT)是一种稳定币，其价值只与单一法定货币挂钩，例如欧元、美元等。EMT实际上是电子货币的一种形式，但使用了区块链技术。

EMT的主要特点包括：
- 只与单一法定货币挂钩(1:1比例)
- 可以轻松用于日常支付和交易
- 监管要求更严格，更接近传统电子货币
- 必须随时可以按面值赎回

### EMT监管要求

根据MICA框架，EMT发行者必须同时满足电子货币机构的要求和特定的EMT要求：

1. **发行者资格**：EMT发行者必须是授权的信贷机构或电子货币机构
2. **白皮书要求**：发布详细的白皮书，披露EMT的特性、权利义务等
3. **资本要求**：遵守《电子货币指令》(EMD2)的资本要求
4. **储备资产管理**：
   - 必须维持100%的储备，完全由相应法定货币支持
   - 储备资产必须存放在信贷机构中，并与发行者的其他资产隔离
   - 储备只能投资于安全、低风险的资产
5. **禁止利息**：不得向EMT持有人支付利息
6. **赎回权利**：持有人必须能够随时以面值赎回，且不收或只收极低费用
7. **大额EMT**：对于价值超过1亿欧元的"重要EMT"，有附加要求
8. **监督与报告**：定期向监管机构报告流通量、储备资产、事件等

### EMT市场上的实例

市场上与EMT概念相似的代币包括：

1. **USDC**：由Circle发行，与美元1:1挂钩，由美元现金和短期国库券支持
2. **EUROC**：Circle发行的欧元稳定币
3. **BUSD（已停止新发行）**：由Paxos发行，与美元1:1挂钩
4. **Paxos Dollar(USDP)**：由Paxos发行的美元稳定币
5. **Gemini Dollar(GUSD)**：由Gemini交易所发行的美元稳定币
6. **PayPal USD(PYUSD)**：PayPal最近发行的美元稳定币

### EMT实现参考

我们的实现已经包含了满足MICA监管要求的核心功能，见 [EMTToken.sol](../contracts/EMTToken.sol)。

关键功能包括：
- 单一法定货币锚定
- KYC/AML合规检查
- 小数点与法定货币一致（欧元、美元等为2位小数）
- 赎回机制，支持低费用或零费用赎回
- 完善的审计和报告机制
- 严格的交易监控和合规控制

## MICA合规性核查清单

为确保您的代币符合MICA规定，请考虑以下核查项目：

### ART合规性核查
- [ ] 发行者是否获得授权并在欧盟注册
- [ ] 是否发布了符合要求的白皮书
- [ ] 是否维持要求的最低资本
- [ ] 储备资产是否充足并得到妥善管理
- [ ] 是否实施了赎回机制
- [ ] 是否建立了治理和风险管理框架
- [ ] 是否提供储备资产的透明度

### EMT合规性核查
- [ ] 发行者是否为授权的信贷机构或电子货币机构
- [ ] 是否发布了符合要求的白皮书
- [ ] 储备资产是否为100%相应的法定货币
- [ ] 储备资产是否妥善保管并隔离
- [ ] 是否不向持有人支付利息
- [ ] 是否允许随时按面值赎回
- [ ] 是否建立了监督和报告机制

## 参考资料

1. [欧盟MICA框架原文](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1114)
2. [European Banking Authority on MICA](https://www.eba.europa.eu/regulation-and-policy/crypto-assets-and-markets-regulation-mica)
3. [Circle USDC 官方文档](https://www.circle.com/en/usdc)
4. [MakerDAO 官方文档](https://makerdao.com/en/whitepaper)
5. [FRAX Finance 官方文档](https://docs.frax.finance/) 