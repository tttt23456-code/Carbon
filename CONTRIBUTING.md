# 贡献指南

感谢您对碳排放计算系统的关注！本指南将帮助您了解如何为项目做出贡献。

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

#### 示例

```bash
# 新功能
git commit -m "feat(calculations): add waste treatment calculator"

# Bug 修复
git commit -m "fix(auth): resolve token refresh issue"

# 文档更新
git commit -m "docs(api): update calculation endpoint documentation"

# 重构
git commit -m "refactor(units): extract unit conversion to separate service"
```

### Pull Request 流程

1. **确保功能完整**：
   - 代码实现完成
   - 添加必要的测试
   - 更新相关文档
   - 通过所有检查

2. **推送分支**：
```bash
git push origin feature/your-feature-name
```

3. **创建 Pull Request**：
   - 使用清晰的标题和描述
   - 关联相关的 Issue
   - 填写 PR 模板

4. **代码审查**：
   - 响应审查意见
   - 修改代码并推送更新
   - 解决所有讨论

5. **合并**：
   - 通过所有检查后将被合并
   - 删除功能分支

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定模块测试
pnpm --filter api test
pnpm --filter web test

# 测试覆盖率
pnpm test:cov

# E2E 测试
pnpm test:e2e

# 监视模式
pnpm test:watch
```

### 测试要求

- **单元测试覆盖率** >= 80%
- **关键功能必须有测试**（计算器、认证、数据库操作）
- **新功能必须包含测试**
- **E2E 测试覆盖主要用户流程**

### 测试示例

```typescript
// 单元测试示例
describe('ElectricityCalculator', () => {
  let calculator: ElectricityCalculator;

  beforeEach(() => {
    calculator = new ElectricityCalculator(unitConverter);
  });

  it('should calculate electricity emissions correctly', async () => {
    const input = {
      activityType: 'electricity',
      amount: 1000,
      unit: 'kWh',
      metadata: {},
    };

    const factor = {
      factorValue: 0.581,
      factorUnit: 'kg CO2e/kWh',
      // ...
    };

    const result = await calculator.calculate(input, factor);
    expect(result.tCO2e).toBeCloseTo(0.581);
  });
});
```

## 🎨 代码规范

### TypeScript 规范

- 使用 **严格模式**（`strict: true`）
- **明确类型定义**，避免 `any`
- 使用 **接口** 定义复杂类型
- **导出类型** 供其他模块使用

```typescript
// 好的示例
interface CalculationInput {
  activityType: string;
  amount: number;
  unit: string;
  metadata?: Record<string, unknown>;
}

export class Calculator {
  async calculate(input: CalculationInput): Promise<CalculationResult> {
    // 实现
  }
}

// 避免
export class Calculator {
  async calculate(input: any): Promise<any> {
    // 避免使用 any
  }
}
```

### 命名规范

- **文件名**：kebab-case (`calculation.service.ts`)
- **类名**：PascalCase (`CalculationService`)
- **函数/变量**：camelCase (`calculateEmissions`)
- **常量**：UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)
- **接口**：PascalCase，不使用 `I` 前缀 (`Calculator`)

### 目录结构

```
apps/api/src/
├── module-name/                 # 模块目录
│   ├── dto/                     # 数据传输对象
│   ├── entities/                # 实体定义
│   ├── interfaces/              # 接口定义
│   ├── services/                # 业务逻辑
│   ├── controllers/             # 控制器
│   ├── module.ts                # 模块定义
│   └── __tests__/               # 测试文件
│       ├── service.spec.ts
│       └── controller.spec.ts
```

## 📚 文档

### API 文档

- 使用 **Swagger/OpenAPI** 注解
- 提供**请求/响应示例**
- 说明**错误码和错误信息**

```typescript
@ApiOperation({ summary: '计算碳排放' })
@ApiResponse({ 
  status: 200, 
  description: '计算成功',
  type: CalculationResultDto 
})
@ApiResponse({ 
  status: 400, 
  description: '输入参数错误' 
})
@Post('calculate')
async calculate(@Body() input: CalculationInputDto) {
  // 实现
}
```

### 代码注释

- **类和方法**添加 JSDoc 注释
- **复杂逻辑**添加行内注释
- **公式和算法**提供参考链接

```typescript
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

## 🐛 报告 Bug

### Bug 报告模板

```markdown
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
security@carbon-calculator.com

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