# 企业碳计量数字化平台 (Carbon Emission Calculator)

遵循 GHG Protocol 的企业级碳排放计算平台，支持 Scope 1/2/3 全范围碳核算。

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/carbon-calculator/carbon)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.1+-blue.svg)](https://www.typescriptlang.org)

## 🌟 特性

### 💼 业务功能
- **完整碳核算** - 支持 Scope 1/2/3 全范围排放计算
- **多租户架构** - 组织级隔离，支持成员权限管理 (RBAC)
- **灵活计算引擎** - 可扩展的计算器框架，支持自定义排放因子
- **数据质量管理** - 支持测量、计算、估算三级数据质量标识
- **批量数据处理** - CSV/Excel 导入导出，批量计算功能
- **实时报表** - 多维度统计分析，可视化图表展示

### 🏗️ 技术特性
- **现代化技术栈** - React 18 + NestJS + TypeScript + Prisma
- **企业级架构** - Monorepo + 微服务 + 容器化部署
- **国际化支持** - 中英文双语，可扩展更多语言
- **API 优先** - OpenAPI/Swagger 文档，RESTful 设计
- **安全可靠** - JWT 认证，审计日志，数据加密
- **云原生** - Docker 容器化，K8s 部署，CI/CD 自动化

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (推荐) 或 npm
- **SQLite** (自动创建，无需额外安装)

### 一键启动

```bash
# 1. 克隆项目
git clone https://github.com/carbon-calculator/carbon.git
cd carbon

# 2. 安装根目录依赖
pnpm install

# 3. 启动后端 API (端口 3001)
pnpm --filter api dev

# 4. 启动前端 Web (新终端窗口，端口 3000)
pnpm --filter web dev
```

> 🎉 **重大改进**: 现在使用 SQLite 数据库，无需 Docker！系统启动更加简单快速。

### 前后端启动说明

#### 后端 API 启动

后端基于 NestJS 构建，使用 pnpm 作为包管理器：

```bash
# 进入项目根目录
cd carbon

# 安装依赖
pnpm install

# 启动后端服务 (开发模式)
pnpm --filter api dev

# 或者进入后端目录启动
cd apps/api
pnpm dev
```

后端服务启动后将在 `http://localhost:3001` 运行，包含以下功能：
- RESTful API 接口
- Swagger API 文档 (http://localhost:3001/api/docs)
- 数据库连接 (SQLite)
- JWT 认证系统

#### 前端 Web 启动

前端基于 React + Vite 构建：

```bash
# 进入项目根目录
cd carbon

# 安装依赖
pnpm install

# 启动前端服务 (开发模式)
pnpm --filter web dev

# 或者进入前端目录启动
cd apps/web
pnpm dev
```

前端服务启动后将在 `http://localhost:3000` 运行，包含以下功能：
- 用户认证界面
- 碳排放数据管理
- 计算引擎界面
- 报表和可视化
- 组织管理功能

## 🖥️ 本机启动演示

### 方式一：快速体验（推荐）

✨ **最新简化版本** - 无需 Docker，使用 SQLite 数据库

```powershell
# Windows 用户
# 1. 克隆或下载项目到本地
git clone https://github.com/carbon-calculator/carbon.git
cd carbon

# 2. 安装依赖
pnpm install  # 使用 pnpm 或 npm install

# 3. 启动后端 API (端口 3001)
pnpm --filter api dev

# 4. 启动前端应用（新终端窗口，端口 3000）
pnpm --filter web dev

# 5. 打开浏览器访问 http://localhost:3000
# 使用演示账号登录：admin@caict-carbon.com / admin123
```

```bash
# Linux/macOS 用户
# 1. 克隆项目
git clone https://github.com/carbon-calculator/carbon.git
cd carbon

# 2. 安装依赖
pnpm install

# 3. 启动后端 API (端口 3001)
pnpm --filter api dev

# 4. 启动前端（新终端窗口，端口 3000）
pnpm --filter web dev

# 5. 访问 http://localhost:3000 体验
```

### 方式二：Docker 一键启动（可选）

如果您喜欢容器化部署：

```bash
# 确保安装了 Docker 和 Docker Compose
# 1. 克隆项目
git clone https://github.com/carbon-calculator/carbon.git
cd carbon

# 2. 一键启动所有服务
docker-compose -f infra/docker/docker-compose.yml up -d

# 3. 等待服务启动完成（约2-3分钟）
# 访问 http://localhost:3000
```

### 🎯 演示流程建议

启动成功后，按以下流程体验系统：

1. **登录系统**
   - 访问 http://localhost:3000
   - 点击"管理员账号"快速登录
   - 或手动输入：admin@caict-carbon.com / admin123

2. **浏览仪表板**
   - 查看碳排放概览统计
   - 了解快捷操作入口

3. **添加活动数据**
   - 点击"活动数据"菜单
   - 添加电力消耗记录（如：1000 kWh）
   - 查看数据质量标识

4. **进行碳排放计算**
   - 进入"碳排放计算"页面
   - 选择"电力消耗"类型
   - 输入数量和单位
   - 查看计算结果和排放分解

5. **查看分析报表**
   - 访问"报表分析"页面
   - 查看 Scope 1/2/3 分布
   - 了解排放趋势图表

6. **管理组织设置**
   - 进入"组织管理"页面
   - 查看成员管理功能
   - 调整组织设置

### ⚠️ 常见问题

**前端启动失败**
```bash
# 如果遇到依赖问题，清除缓存重新安装
rm -rf node_modules package-lock.json  # Linux/macOS
Remove-Item -Recurse -Force node_modules, package-lock.json  # Windows
pnpm install
```

**后端启动失败**
```bash
# 检查端口是否被占用
netstat -ano | findstr :3001  # Windows
lsof -i :3001  # Linux/macOS

# 清理进程
taskkill /f /im node.exe  # Windows
pkill node  # Linux/macOS
```

**数据库相关**
- 使用 SQLite 数据库，文件自动创建在 `apps/api/prisma/dev.db`
- 如需重置数据库，删除该文件重新启动即可
- 数据库连接失败时，检查 `apps/api/.env` 配置

### 访问地址

- **前端应用**: http://localhost:3000
- **后端 API**: http://localhost:3001
- **API 文档**: http://localhost:3001/api/docs
- **健康检查**: http://localhost:3001/api/v1/health
- **SQLite 数据库**: `apps/api/prisma/dev.db` (本地文件)

### 演示账号

```
管理员: admin@caict-carbon.com / admin123
经理: manager@caict-carbon.com / manager123
成员: member@caict-carbon.com / member123
```

## 🗄️ 数据库配置

### SQLite 数据库 (默认)

项目默认使用 SQLite 数据库，**无需额外安装**，开箱即用：

```bash
# 数据库文件位置
apps/api/prisma/dev.db

# 数据库连接字符串 (apps/api/.env)
DATABASE_URL="file:./dev.db"

# 初始化数据库（首次运行自动执行）
cd apps/api
pnpm db:migrate     # 创建数据库结构
pnpm db:seed     # 导入示例数据（可选）
```

**SQLite 优势**:
- ✅ 零配置：无需安装数据库服务器
- ✅ 单文件：便于备份和迁移
- ✅ 高性能：适合中小型应用
- ✅ 跨平台：Windows/Linux/macOS 通用

### PostgreSQL 数据库 (生产环境)

如需切换到 PostgreSQL：

```bash
# 1. 修改 apps/api/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 2. 更新环境变量 (apps/api/.env)
DATABASE_URL="postgresql://username:password@localhost:5432/carbon_db"

# 3. 重新生成 Prisma 客户端
cd apps/api
pnpm db:generate
pnpm db:migrate:deploy
```

### 数据库管理

```bash
# 查看数据库结构
pnpm --filter api db:studio    # 打开 Prisma Studio

# 数据库迁移
pnpm --filter api db:migrate   # 创建迁移文件

# 重置数据库
pnpm --filter api db:reset     # 清空并重建数据库
```

## 📋 项目结构

```
carbon/
├── apps/                           # 应用程序
│   ├── api/                        # 后端 API (NestJS)
│   │   ├── src/
│   │   │   ├── auth/              # 认证模块
│   │   │   ├── calculations/      # 计算引擎
│   │   │   ├── organizations/     # 组织管理
│   │   │   ├── activity-records/  # 活动数据
│   │   │   ├── emission-factors/  # 排放因子
│   │   │   └── reports/           # 报表模块
│   │   ├── prisma/                # 数据库模型
│   │   └── test/                  # 测试文件
│   └── web/                       # 前端应用 (React)
│       ├── src/
│       │   ├── components/        # UI 组件
│       │   ├── pages/             # 页面组件
│       │   ├── hooks/             # 自定义 Hooks
│       │   ├── services/          # API 服务
│       │   └── utils/             # 工具函数
│       └── public/                # 静态资源
├── packages/                      # 共享包
│   ├── types/                     # 类型定义
│   ├── ui/                        # UI 组件库
│   └── config/                    # 配置文件
├── infra/                         # 基础设施
│   ├── docker/                    # Docker 配置
│   ├── k8s/                       # Kubernetes 配置
│   └── db/                        # 数据库脚本
├── scripts/                       # 脚本文件
└── docs/                          # 文档
```

## 🎯 核心概念

### 数据模型关系

``mermaid
erDiagram
    Organization ||--o{ User : has
    Organization ||--o{ Facility : contains
    Organization ||--o{ Project : manages
    Organization ||--o{ ActivityRecord : owns
    Organization ||--o{ EmissionFactor : customizes
    
    User ||--o{ Membership : belongs
    ActivityRecord ||--|| CalculationResult : generates
    EmissionFactor ||--o{ CalculationResult : calculates
    
    ActivityRecord }o--|| Facility : "belongs to"
    ActivityRecord }o--|| Project : "part of"
```

### 计算流程

``mermaid
flowchart TD
    A[活动数据录入] --> B[数据验证与标准化]
    B --> C[选择排放因子]
    C --> D[单位转换]
    D --> E[计算引擎处理]
    E --> F[生成计算结果]
    F --> G[保存与审计]
    G --> H[报表与分析]
```

## 🧮 计算引擎

### 支持的活动类型

| Scope | 类别 | 活动类型 | 描述 |
|-------|------|----------|------|
| Scope 1 | 固定燃烧 | `natural_gas`, `diesel`, `gasoline` | 燃料燃烧排放 |
| Scope 2 | 电力 | `electricity` | 外购电力排放 |
| Scope 3 | 商务出行 | `flight_*`, `road_freight` | 差旅和运输排放 |
| Scope 3 | 废弃物 | `waste_*` | 废弃物处理排放 |

### 计算公式

``typescript
// 基础公式
emissions(tCO2e) = activityAmount × emissionFactor × unitConversion × GWP

// 电力计算 (地点法)
emissions = kWh × gridEmissionFactor(kgCO2e/kWh) / 1000

// 燃料燃烧
emissions = fuelAmount × carbonContent × oxidationFactor × (44/12) / 1000

// 航班排放
emissions = passengerKm × flightFactor × cabinMultiplier × RFI / 1000
```

### 自定义计算器

``typescript
// 实现 Calculator 接口
export class CustomCalculator extends BaseCalculator {
  getSupportedActivityTypes(): string[] {
    return ['custom_activity'];
  }

  async calculate(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult> {
    // 自定义计算逻辑
    const emissions = input.normalizedAmount * factor.factorValue;
    return {
      tCO2e: emissions / 1000,
      breakdown: {
        // 计算明细
      },
      method: 'Custom Calculation',
      dataQuality: 'calculated',
    };
  }
}
```

## 📊 排放因子管理

### 系统内置因子

系统预置了常用的排放因子，包括：
- **中国电网平均排放因子** (0.5810 kg CO2e/kWh, 2023)
- **IPCC 燃料排放因子** (天然气、柴油、汽油等)
- **DEFRA 交通排放因子** (航班、货运等)
- **EPA 废弃物排放因子** (填埋、焚烧、回收等)

### 自定义排放因子

``typescript
// 创建组织自定义排放因子
const customFactor = {
  organizationId: "org-123",
  activityType: "renewable_electricity",
  region: "CN-BJ",
  year: 2024,
  factorValue: 0.0, // 可再生能源零排放
  factorUnit: "kg CO2e/kWh",
  source: "CUSTOM",
  reference: "购电协议证明",
  priority: 100, // 高优先级
};
```

### 排放因子优先级

1. **组织自定义因子** (最高优先级)
2. **最新年份因子**
3. **高优先级因子**
4. **默认因子**

## 🔧 开发指南

### 添加新的计算器

1. **创建计算器类**
```typescript
// apps/api/src/calculations/calculators/my-calculator.ts
export class MyCalculator extends BaseCalculator {
  // 实现接口方法
}
```

2. **注册计算器**
```typescript
// apps/api/src/calculations/calculators/calculator-registry.service.ts
constructor(private myCalculator: MyCalculator) {
  this.registerCalculator(this.myCalculator);
}
```

3. **添加测试**
```typescript
// apps/api/src/calculations/calculators/my-calculator.spec.ts
describe('MyCalculator', () => {
  // 测试用例
});
```

### 单位转换

``typescript
// 使用单位转换服务
const converter = this.unitConverter.getConverter('energy');
const kWh = converter.convert(1, 'MWh', 'kWh'); // 1000
```

### API 客户端

``typescript
// 前端调用 API
import { api } from '@/services/api';

const result = await api.calculations.calculate({
  activityType: 'electricity',
  amount: 1000,
  unit: 'kWh',
});
```

## 🧪 系统验证

为了确保系统的完整性，我们提供了自动化验证脚本：

```bash
# 运行系统功能验证
node scripts/validate-system.js

# 或者使用 pnpm
pnpm validate
```

验证内容包括：
- ✅ 项目结构完整性
- ✅ 后端组件和 API 接口
- ✅ 前端页面和组件
- ✅ 共享包和 UI 组件
- ✅ 测试用例覆盖
- ✅ 配置文件和 Docker 设置
- ✅ 核心功能可用性

成功率达到 90% 以上表示系统准备就绪。

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 测试覆盖率
pnpm test:cov

# E2E 测试
pnpm test:e2e

# 监视模式
pnpm test:watch
```

## 🚀 部署

### Docker 部署

```bash
# 生产环境
.\scripts\start.ps1 prod

# 自定义配置
docker-compose -f infra/docker/docker-compose.yml up -d
```

### Kubernetes 部署

```bash
# 应用配置
kubectl apply -f infra/k8s/

# 检查状态
kubectl get pods -n carbon-system
```

### 云平台部署

项目支持一键部署到：
- **Render** - `render.yaml`
- **Railway** - `railway.json`
- **Fly.io** - `fly.toml`
- **Vercel** - `vercel.json`

## 📈 性能与监控

### 性能指标

- **API 响应时间** < 200ms (P95)
- **数据库查询** < 100ms (P95)
- **批量计算** 1000 条记录 < 10s
- **内存使用** < 512MB
- **并发用户** 支持 1000+

### 监控集成

```
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
  grafana:
    image: grafana/grafana
  jaeger:
    image: jaegertracing/all-in-one
```

## 🔒 安全

### 认证与授权

- **JWT** 双令牌机制 (Access + Refresh)
- **RBAC** 基于角色的权限控制
- **API 速率限制** 防止滥用
- **CORS** 跨域安全配置

### 数据保护

- **数据加密** 敏感数据存储加密
- **审计日志** 完整操作追踪
- **软删除** 数据恢复机制
- **备份策略** 自动化数据备份

## 🌍 国际化

```
// 添加新语言
// apps/web/src/locales/fr.json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler"
  }
}

// 使用翻译
const { t } = useTranslation();
return <button>{t('common.save')}</button>;
```

## 🤝 贡献指南

### 开发流程

1. **Fork** 项目
2. **创建特性分支** `git checkout -b feature/amazing-feature`
3. **提交更改** `git commit -m 'feat: add amazing feature'`
4. **推送分支** `git push origin feature/amazing-feature`
5. **创建 Pull Request**

### 提交规范

遵循 [Conventional Commits](https://conventionalcommits.org/) 规范：

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 代码审查清单

- [ ] 代码符合项目风格规范
- [ ] 添加了必要的测试用例
- [ ] 更新了相关文档
- [ ] API 变更添加了版本兼容性
- [ ] 性能影响评估
- [ ] 安全性检查

## 📝 变更日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的版本更新记录。

### v1.0.0 (2024-09-04)

#### 🎉 初始版本
- ✨ 完整的碳排放计算系统
- 🏗️ Monorepo 架构设计
- 🧮 支持 Scope 1/2/3 计算
- 🔐 完整的认证授权系统
- 📊 实时报表和数据分析
- 🐳 Docker 容器化部署
- 📚 完整的 API 文档

#### 🗄️ 数据库优化
- 🚀 **重大改进**：从 PostgreSQL 迁移到 SQLite
- ✅ **零配置**：无需 Docker，开箱即用
- ✅ **简化部署**：单文件数据库，便于备份迁移
- ✅ **跨平台**：Windows/Linux/macOS 完美支持
- 🔧 修复所有 TypeScript 类型兼容性问题

#### 🧮 计算器支持
- ⚡ 电力消耗计算器 (地点法/市场法)
- 🔥 燃料燃烧计算器 (天然气/柴油/汽油等)
- ✈️ 航班排放计算器 (舱位/航程调整)
- 🚛 货运排放计算器 (多式联运支持)
- 🗑️ 废弃物处理计算器 (填埋/焚烧/回收)

#### 📊 数据管理
- 📈 活动数据录入与批量导入
- 🧮 排放因子管理 (系统内置+自定义)
- 📋 计算结果存储与追溯
- 📊 多维度统计分析

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🙏 致谢

感谢以下开源项目和标准：

- [GHG Protocol](https://ghgprotocol.org/) - 温室气体核算标准
- [IPCC Guidelines](https://www.ipcc.ch/) - 气候变化评估报告
- [NestJS](https://nestjs.com/) - 企业级 Node.js 框架
- [React](https://reactjs.org/) - 用户界面库
- [Prisma](https://prisma.io/) - 现代数据库工具包

## 📞 支持

如有问题或建议，请通过以下方式联系：

- **GitHub Issues**: [提交问题](https://github.com/carbon-calculator/carbon/issues)
- **邮箱**: support@caict-carbon.com
- **文档**: [在线文档](https://docs.carbon-calculator.com)
- **社区**: [Discord 频道](https://discord.gg/carbon)

---

**让我们一起为碳中和目标贡献力量！** 🌱

## 🚀 快速体验提醒

### 🎯 新用户推荐流程

如果您是第一次接触这个项目，建议按以下顺序体验：

1. **⚡ 2分钟快速启动**：按照"方式一"启动系统，体验完整功能
2. **🎮 功能演示**：按照演示流程依次体验各个功能模块
3. **🔧 系统验证**：运行 `pnpm validate` 验证系统完整性
4. **🐳 容器部署**：如有需要，尝试 Docker 部署体验

### 💡 核心亮点

- 📊 **现代化界面**：基于 React 18 + TypeScript 的专业碳排放管理界面
- 🧮 **专业计算引擎**：严格遵循 GHG Protocol 标准的计算算法
- 📈 **数据可视化**：多维度统计分析和实时图表展示
- 🏢 **企业级架构**：多租户、权限管理、审计日志完整方案
- 🗄️ **零配置数据库**：SQLite 开箱即用，无需额外安装
- 🚀 **快速部署**：从克隆到运行仅需几分钟

### 🎉 最新改进 (v1.0.0)

- ✅ **简化部署**：从 PostgreSQL + Docker 改为 SQLite，大大降低了部署复杂度
- ✅ **零依赖启动**：仅需 Node.js，无需 Docker 或数据库服务器
- ✅ **开发友好**：修复所有 TypeScript 编译错误，提供完整类型支持
- ✅ **即开即用**：数据库自动创建，示例数据可选导入

💡 **提示**：系统设计遵循企业级标准，支持真实的碳核算业务场景，可直接用于生产环境。