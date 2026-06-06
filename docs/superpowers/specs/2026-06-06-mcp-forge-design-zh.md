# MCP Forge - 设计规格书

## 概述

**名称**：MCP Forge
**标语**：构建 MCP Server 的最快方式
**目标**：一个 CLI 工具 + 开发框架，让开发者 30 秒创建生产级 MCP Server。

MCP（Model Context Protocol）是连接 AI 工具和 IDE（Cursor、Claude Desktop、Continue、Zed）的事实标准。然而，构建 MCP Server 仍然需要大量样板代码、手动编写 JSON Schema，且缺乏调试工具。MCP Forge 填补了这个空白。

## 架构

```
mcp-forge/
├── packages/
│   ├── cli/            # CLI 入口（mcp-forge 命令）
│   ├── core/           # 核心库（项目生成、模板引擎、配置管理）
│   ├── dev-server/     # 开发服务器（热重载、TUI 调试器）
│   └── templates/      # 内置模板集合
├── templates/          # 模板源文件
│   ├── minimal/        # 最小 MCP 服务器
│   ├── rest-api/       # REST API 包装器
│   ├── database/       # 数据库连接器
│   ├── filesystem/     # 文件系统工具
│   ├── web-scraper/    # Web 爬虫
│   └── ai-tool/        # AI 工具包装器
└── examples/           # 示例项目
```

使用 pnpm workspaces 管理的 monorepo，tsup 构建。

## 核心命令

### `mcp-forge create`

交互式脚手架，生成完整的 MCP Server 项目。

流程：
1. 询问：项目名称、描述、作者
2. 询问：选择模板（minimal / rest-api / database / filesystem / web-scraper / ai-tool）
3. 询问：定义工具（名称、描述、使用 Zod schema 的参数）
4. 生成：package.json、tsconfig.json、src/index.ts、src/tools/*.ts、tests/*.test.ts、mcp-forge.config.ts、README.md
5. 自动安装依赖

选项：
- `--template <name>` - 跳过模板选择
- `--yes` - 所有提示使用默认值
- `--tools <tool1,tool2>` - 预定义工具名称

### `mcp-forge dev`

以开发模式启动 MCP Server，支持热重载和 TUI 调试面板。

功能：
- 文件监听：代码变更时自动重启服务器
- TUI 面板显示：工具调用日志、错误信息、请求/响应数据
- 内置测试客户端：直接在 TUI 中调用工具
- 服务器重启时自动重连

### `mcp-forge test`

对 MCP Server 运行自动化测试。

功能：
- 从工具定义自动生成测试骨架
- 验证工具 schema
- 使用示例输入测试工具执行
- 输出测试报告

### `mcp-forge inspect <server-path>`

连接到运行中的 MCP Server，展示其能力。

功能：
- 列出所有工具及其描述和参数 schema
- 列出资源和提示词
- 交互式工具调用
- JSON schema 验证

### `mcp-forge add <tool-name>`

向现有 MCP Forge 项目添加新工具。

流程：
1. 询问：工具名称、描述
2. 询问：参数定义（名称、类型、是否必填、描述）
3. 生成：src/tools/<tool-name>.ts 实现骨架
4. 自动在 src/index.ts 中注册

## 技术栈

- **语言**：TypeScript
- **运行时**：Node.js 18+
- **CLI 框架**：Commander.js
- **TUI**：Ink（React for CLI）
- **Schema**：Zod（工具参数定义，自动生成 JSON Schema）
- **MCP SDK**：@modelcontextprotocol/sdk
- **模板引擎**：Handlebars
- **测试**：Vitest
- **构建**：tsup
- **包管理器**：pnpm（monorepo）

## 生成的项目结构（以 rest-api 模板为例）

```
my-mcp-server/
├── src/
│   ├── index.ts          # MCP Server 入口
│   ├── tools/
│   │   └── search.ts     # 工具实现
│   └── utils/
│       └── helpers.ts    # 工具函数
├── tests/
│   └── search.test.ts    # 自动生成的测试骨架
├── package.json
├── tsconfig.json
├── mcp-forge.config.ts   # MCP Forge 配置
└── README.md
```

## 关键设计决策

1. **TypeScript 优先**：MCP 生态以 TypeScript 为主，保持一致性减少摩擦。
2. **Zod Schema 驱动**：工具参数用 Zod 定义 → 自动生成 JSON Schema + 类型安全 + 测试骨架，单一数据源。
3. **零配置开发**：`mcp-forge dev` 开箱即用，无需手动配置调试环境。
4. **可扩展模板**：社区可以通过 npm 包创建和分享自定义模板。
5. **Monorepo 结构**：关注点清晰分离，每个包可独立发布。

## 模板系统

每个模板是一个目录，包含：

```
templates/rest-api/
├── template.json        # 模板元数据（名称、描述、提示词）
├── package.json.hbs     # Handlebars 模板
├── src/
│   ├── index.ts.hbs     # 服务器入口模板
│   └── tools/
│       └── _tool.ts.hbs # 工具实现模板
├── tests/
│   └── _tool.test.ts.hbs
└── README.md.hbs
```

模板变量：`{{projectName}}`、`{{description}}`、`{{author}}`、`{{tools}}`（工具定义数组）。

## mcp-forge.config.ts 配置文件

```typescript
import { defineConfig } from 'mcp-forge';

export default defineConfig({
  server: {
    name: 'my-mcp-server',
    version: '1.0.0',
  },
  tools: ['./src/tools/*.ts'],
  dev: {
    watch: ['./src'],
    hotReload: true,
  },
});
```

## 病毒式传播策略

1. **README 动图**：展示 30 秒从创建到运行的完整流程
2. **零安装体验**：`npx mcp-forge create` 无需全局安装即可使用
3. **高质量模板**：生成的代码是生产级的，不只是脚手架
4. **AI IDE 集成**：生成的服务器可直接在 Claude Code、Cursor 等 AI IDE 中使用
5. **社区模板**：基于 npm 的模板分享机制，促进生态增长

## 成功指标

- 3 个月内 GitHub star 1000+
- 6 个月内社区模板 50+
- 至少 3 个热门 MCP Server 项目使用 MCP Forge
