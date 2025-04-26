# 🤝 贡献指南

感谢您考虑为 TurboChainScaffold 项目做出贡献！

## 🚀 如何贡献

1. Fork仓库并克隆到本地
2. 创建新分支 `git checkout -b feature/your-feature-name`
3. 提交更改 `git commit -m "feat: add some feature"`
4. 推送到分支 `git push origin feature/your-feature-name`
5. 提交Pull Request

## 📋 开发标准

### 代码风格

- 遵循各语言的标准代码风格
  - JavaScript/TypeScript: ESLint + Prettier
  - Solidity: Solhint
  - Rust: rustfmt
  - Move: sui-move-analyzer

### Git提交规范

遵循[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/):

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

类型：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码风格更改（不影响代码功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 添加或更新测试
- `chore`: 构建过程或辅助工具变动

例如:
```
feat(evm): 添加新的EVM链支持
```

### Pull Request流程

1. PR应该有清晰的标题和描述
2. 确保CI检查通过
3. 至少需要一个维护者审核
4. 确保更新了相关文档

## 🧪 测试指南

在提交PR前，请确保:

1. 所有新功能都有相应的测试
2. 所有测试都能通过
3. EVM合约测试: `cd chains/evm && npx hardhat test`
4. 前端测试: `cd apps/dapp-ui && yarn test`

## 📃 文档指南

当添加新功能或更改现有功能时:

1. 更新相关README文件
2. 如果需要，添加或更新[开发指南](./DEVELOPMENT.md)
3. 在CHANGELOG.md中记录重要变更

## 🚑 报告Bug

发现bug时:

1. 检查Issue列表，查看是否已经有人报告
2. 如果没有，创建新Issue
3. 使用Bug模板，提供:
   - 问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（操作系统、Node版本等）
   - 相关截图或日志

## 💡 提出新功能

想要提出新功能:

1. 创建Issue使用功能请求模板
2. 描述功能并解释其价值
3. 如果可能，提供实现思路或伪代码

## 📚 资源

- [开发指南](./DEVELOPMENT.md)
- [行为准则](./CODE_OF_CONDUCT.md)
- [项目Roadmap](../README.md#roadmap)

---

感谢您的贡献！