# MCP Forge - Design Spec

## Overview

**Name**: MCP Forge
**Tagline**: The fastest way to build MCP Servers
**Goal**: A CLI tool + development framework that lets developers create production-ready MCP Servers in 30 seconds.

MCP (Model Context Protocol) is the de facto standard for connecting AI tools and IDEs (Cursor, Claude Desktop, Continue, Zed). However, building MCP Servers still requires significant boilerplate, manual JSON Schema writing, and lacks debugging tooling. MCP Forge fills this gap.

## Architecture

```
mcp-forge/
├── packages/
│   ├── cli/            # CLI entry point (mcp-forge command)
│   ├── core/           # Core library (project generation, template engine, config)
│   ├── dev-server/     # Dev server (hot reload, TUI debugger)
│   └── templates/      # Built-in template collection
├── templates/          # Template source files
│   ├── minimal/        # Minimal MCP server
│   ├── rest-api/       # REST API wrapper
│   ├── database/       # Database connector
│   ├── filesystem/     # File system tool
│   ├── web-scraper/    # Web scraper
│   └── ai-tool/        # AI tool wrapper
└── examples/           # Example projects
```

Monorepo managed with pnpm workspaces + tsup for building.

## Core Commands

### `mcp-forge create`

Interactive scaffold that generates a complete MCP Server project.

Flow:
1. Ask: project name, description, author
2. Ask: select template (minimal / rest-api / database / filesystem / web-scraper / ai-tool)
3. Ask: define tools (name, description, parameters with Zod schemas)
4. Generate: package.json, tsconfig.json, src/index.ts, src/tools/*.ts, tests/*.test.ts, mcp-forge.config.ts, README.md
5. Install dependencies automatically

Options:
- `--template <name>` - skip template selection
- `--yes` - use defaults for all prompts
- `--tools <tool1,tool2>` - pre-define tool names

### `mcp-forge dev`

Starts the MCP Server in development mode with hot reload and a TUI debug panel.

Features:
- File watcher: restarts server on code changes
- TUI panel showing: tool call logs, errors, request/response payloads
- Built-in test client: invoke tools directly from the TUI
- Auto-reconnect on server restart

### `mcp-forge test`

Runs automated tests against the MCP Server.

Features:
- Auto-generates test skeletons from tool definitions
- Validates tool schemas
- Tests tool execution with sample inputs
- Outputs test report

### `mcp-forge inspect <server-path>`

Connects to a running MCP Server and displays its capabilities.

Features:
- Lists all tools with descriptions and parameter schemas
- Lists resources and prompts
- Interactive tool invocation
- JSON schema validation

### `mcp-forge add <tool-name>`

Adds a new tool to an existing MCP Forge project.

Flow:
1. Ask: tool name, description
2. Ask: parameter definitions (name, type, required, description)
3. Generate: src/tools/<tool-name>.ts with implementation skeleton
4. Auto-register in src/index.ts

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **CLI Framework**: Commander.js
- **TUI**: Ink (React for CLI)
- **Schema**: Zod (tool parameter definitions, auto-generates JSON Schema)
- **MCP SDK**: @modelcontextprotocol/sdk
- **Template Engine**: Handlebars
- **Testing**: Vitest
- **Build**: tsup
- **Package Manager**: pnpm (monorepo)

## Generated Project Structure (rest-api template example)

```
my-mcp-server/
├── src/
│   ├── index.ts          # MCP Server entry point
│   ├── tools/
│   │   └── search.ts     # Tool implementation
│   └── utils/
│       └── helpers.ts    # Utility functions
├── tests/
│   └── search.test.ts    # Auto-generated test skeleton
├── package.json
├── tsconfig.json
├── mcp-forge.config.ts   # MCP Forge configuration
└── README.md
```

## Key Design Decisions

1. **TypeScript-first**: MCP ecosystem is TypeScript-dominant; consistency reduces friction.
2. **Zod Schema-driven**: Tool parameters defined with Zod → auto-generates JSON Schema + type safety + test skeletons. Single source of truth.
3. **Zero-config dev**: `mcp-forge dev` works out of the box; no manual debugging setup needed.
4. **Extensible templates**: Community can create and share custom templates via npm packages.
5. **Monorepo structure**: Clean separation of concerns; each package can be published independently if needed.

## Template System

Each template is a directory containing:

```
templates/rest-api/
├── template.json        # Template metadata (name, description, prompts)
├── package.json.hbs     # Handlebars template for package.json
├── src/
│   ├── index.ts.hbs     # Server entry point template
│   └── tools/
│       └── _tool.ts.hbs # Tool implementation template
├── tests/
│   └── _tool.test.ts.hbs
└── README.md.hbs
```

Template variables: `{{projectName}}`, `{{description}}`, `{{author}}`, `{{tools}}` (array of tool definitions).

## mcp-forge.config.ts

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

## Viral Growth Strategy

1. **Animated README demo**: GIF showing 30-second create-to-run flow
2. **Zero-install try**: `npx mcp-forge create` works without global install
3. **High-quality templates**: Generated code is production-ready, not just scaffolding
4. **AI IDE integration**: Generated servers work immediately with Claude Code, Cursor, etc.
5. **Community templates**: npm-based template sharing enables ecosystem growth

## Success Metrics

- 1000+ GitHub stars within 3 months
- 50+ community templates within 6 months
- Used by at least 3 popular MCP server projects
