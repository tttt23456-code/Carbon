# 贡献指南

感谢您对企业碳计量数字化平台的关注！本指南将帮助您了解如何为项目做出贡献。

## 🚀 快速开始

### 环境设置

1. **Fork 项目**到您的 GitHub 账户
2. **克隆 Fork 后的仓库**：
```bash
git clone https://github.com/YOUR_USERNAME/carbon.git
cd carbon
```

3. **添加上游仓库**：
```bash
git remote add upstream https://github.com/carbon-calculator/carbon.git
```

4. **安装依赖**：
```bash
pnpm install
```

5. **启动开发环境**：
```bash
.\scripts\start.ps1 dev  # Windows
# ./scripts/start.sh dev  # Linux/macOS
```

## 📋 开发流程

### 分支策略

我们使用 **Git Flow** 分支模型：

- `main` - 生产环境代码
- `develop` - 开发主分支
- `feature/*` - 新功能开发
- `bugfix/*` - Bug 修复
- `release/*` - 版本发布准备
- `hotfix/*` - 紧急修复

### 创建功能分支

```bash
# 更新本地代码
git checkout develop
git pull upstream develop

# 创建新的功能分支
git checkout -b feature/your-feature-name

# 示例
git checkout -b feature/add-scope3-transport-calculator
```

### 提交规范

我们使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构（既不是新功能也不是 Bug 修复）
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统或外部依赖变更
- `ci`: CI 配置文件和脚本变更
- `chore`: 其他不修改源码的变更
- `revert`: 回滚之前的提交

#### 示例提交信息

```
feat(calculator): 添加废弃物处理计算器

- 支持填埋、焚烧、回收三种处理方式
- 添加甲烷回收率参数
- 实现 EPA 排放因子计算逻辑

Closes #123
```

### 代码审查

所有 Pull Request 都需要经过代码审查：

1. **自检清单**
   - [ ] 代码符合项目规范
   - [ ] 添加了必要的测试
   - [ ] 更新了相关文档
   - [ ] 通过了所有 CI 检查

2. **审查要点**
   - 代码质量和可读性
   - 功能实现的正确性
   - 性能和安全性考虑
   - 测试覆盖率

## 🧪 测试规范

### 测试类型

- **单元测试** - 测试单个函数或类
- **集成测试** - 测试模块间交互
- **端到端测试** - 测试完整用户流程

### 命令行工具

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test:api
pnpm test:web

# 测试覆盖率
pnpm test:cov

# 监视模式
pnpm test:watch
```

### 测试最佳实践

- **命名规范**: `功能名.test.ts` 或 `功能名.spec.ts`
- **描述清晰**: 使用 `describe` 和 `it` 准确描述测试场景
- **独立性**: 每个测试应该独立运行
- **断言明确**: 使用明确的期望值

## 📝 文档规范

### 注释风格

- **JSDoc** 用于公共 API
- **行内注释** 解释复杂逻辑
- **TODO 注释** 标记待办事项

### 代码注释

- **类和方法**添加 JSDoc 注释
- **复杂逻辑**添加行内注释
- **公式和算法**提供参考链接

```
/**
 * 电力消耗碳排放计算器
 * 
 * 支持地点法和市场法两种计算方式：
 * - 地点法：使用电网平均排放因子
 * - 市场法：考虑购电协议和可再生能源证书
 * 
 * @see https://ghgprotocol.org/scope_2_guidance
 */
export class ElectricityCalculator extends BaseCalculator {
  /**
   * 计算电力消耗的碳排放量
   * 
   * 公式：emissions = kWh × factor × (transmission_losses + 1)
   * 
   * @param input 标准化输入数据
   * @param factor 排放因子
   * @returns 计算结果
   */
  async calculate(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult> {
    // 实现
  }
}
```

### README 更新

当添加新功能时，请更新相关文档：

- **功能列表**
- **使用示例**
- **配置说明**
- **API 文档链接**

## 🔧 开发工具

### 推荐 IDE 配置

**VS Code** 扩展：
- TypeScript
- Prettier
- ESLint
- Prisma
- Docker
- GitLens

**配置文件** (`.vscode/settings.json`)：
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Git Hooks

项目使用 Husky 配置了以下 Git Hooks：

- **pre-commit**: 运行 lint-staged
- **commit-msg**: 验证提交信息格式
- **pre-push**: 运行测试

## 🚀 发布流程

### 版本号规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **MAJOR** 不兼容的重大更新
- **MINOR** 向后兼容的功能新增
- **PATCH** 向后兼容的问题修正

### 发布步骤

1. **更新版本号**
   ```bash
   npm version patch  # 修订版本
   npm version minor  # 次要版本
   npm version major  # 主要版本
   ```

2. **生成变更日志**
   ```bash
   npm run changelog
   ```

3. **推送更改**
   ```bash
   git push origin main --tags
   ```

4. **发布到 NPM**
   ```bash
   npm publish
   ```

## 🐛 报告 Bug

### Bug 报告模板

```
## Bug 描述
简要描述遇到的问题

## 复现步骤
1. 进入页面 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 出现错误

## 期望行为
描述您期望发生的情况

## 实际行为
描述实际发生的情况

## 环境信息
- OS: [例如 Windows 11]
- Browser: [例如 Chrome 118]
- Node.js: [例如 18.17.0]
- 版本: [例如 v1.0.0]

## 附加信息
- 控制台错误信息
- 屏幕截图
- 相关日志
```

### 安全漏洞

如果发现安全漏洞，请**不要**在公开 Issue 中报告，而是发送邮件到：
security@caict-carbon.com

## 🏗️ 架构指南

### 添加新的计算器

1. **创建计算器类**：
```typescript
// apps/api/src/calculations/calculators/my-calculator.ts
export class MyCalculator extends BaseCalculator {
  getSupportedActivityTypes(): string[] {
    return ['my_activity_type'];
  }

  protected getNormalizedUnit(activityType: string): string {
    return 'kg'; // 标准单位
  }

  protected getCalculationMethod(): string {
    return 'My Calculation Method';
  }
}
```

2. **注册计算器**：
```typescript
// apps/api/src/calculations/calculators/calculator-registry.service.ts
constructor(
  // ... existing calculators
  private myCalculator: MyCalculator,
) {
  this.registerCalculator(this.myCalculator);
}
```

3. **添加到模块**：
```typescript
// apps/api/src/calculations/calculations.module.ts
@Module({
  providers: [
    // ... existing providers
    MyCalculator,
  ],
})
```

4. **编写测试**：
```typescript
// apps/api/src/calculations/calculators/__tests__/my-calculator.spec.ts
describe('MyCalculator', () => {
  // 测试用例
});
```

### 添加新的单位转换器

```typescript
// apps/api/src/calculations/units/my-unit-converter.ts
export class MyUnitConverter implements UnitConverter {
  private readonly conversions = {
    'base_unit': 1,
    'other_unit': 0.5,
  };

  convert(value: number, fromUnit: string, toUnit: string): number {
    // 实现转换逻辑
  }
}
```

### 扩展数据库模型

1. **修改 Prisma schema**：
```prisma
// apps/api/prisma/schema.prisma
model NewEntity {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. **生成迁移**：
```bash
cd apps/api
npx prisma migrate dev --name add_new_entity
```

3. **更新种子数据**：
```typescript
// apps/api/prisma/seed.ts
const newEntity = await prisma.newEntity.create({
  data: {
    name: 'Example',
  },
});
```

## 📊 性能指南

### 性能目标

- **API 响应时间**: < 200ms (P95)
- **数据库查询**: < 100ms (P95)
- **页面加载时间**: < 2s
- **内存使用**: < 512MB

### 优化建议

1. **数据库查询优化**：
   - 使用适当的索引
   - 避免 N+1 查询
   - 使用分页

2. **缓存策略**：
   - Redis 缓存热点数据
   - HTTP 缓存静态资源
   - 查询结果缓存

3. **前端优化**：
   - 代码分割
   - 懒加载
   - 图片优化

## 🔒 安全

### 安全检查清单

- [ ] 输入验证和清理
- [ ] SQL 注入防护
- [ ] XSS 防护
- [ ] CSRF 防护
- [ ] 敏感数据加密
- [ ] 安全头设置
- [ ] 依赖安全扫描

### 安全实践

```typescript
// 输入验证
@IsString()
@Length(1, 100)
@Matches(/^[a-zA-Z0-9_-]+$/)
activityType: string;

// 查询参数化
const users = await prisma.user.findMany({
  where: {
    organizationId: organizationId, // 参数化查询
  },
});

// 敏感数据处理
const { passwordHash, ...safeUser } = user;
return safeUser;
```

## 📞 获取帮助

### 沟通渠道

- **GitHub Discussions**: 功能讨论和问答
- **GitHub Issues**: Bug 报告和功能请求
- **Discord**: 实时讨论
- **邮箱**: 私密问题和安全报告

### 常见问题

**Q: 如何添加新的排放因子？**
A: 参考 `apps/api/prisma/seed.ts` 中的示例，或通过 API 动态添加。

**Q: 如何自定义计算逻辑？**
A: 继承 `BaseCalculator` 类并实现相关方法，参考现有计算器实现。

**Q: 如何贡献多语言翻译？**
A: 在 `apps/web/src/locales/` 目录下添加新的语言文件。

感谢您的贡献！🎉