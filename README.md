# MCP Forge

> The fastest way to build MCP Servers

MCP Forge is a CLI tool that scaffolds, develops, and inspects [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) servers. Create a production-ready MCP server in 30 seconds.

## Features

- **`mcp-forge create`** - Interactive scaffold with 6 built-in templates
- **`mcp-forge add`** - Add new tools to existing projects
- **`mcp-forge dev`** - Hot-reload development mode
- **`mcp-forge inspect`** - Inspect any MCP Server's capabilities

## Quick Start

```bash
# Create a new MCP Server (no install needed)
npx @mcp-forge/cli create my-server

# Or install globally
npm install -g @mcp-forge/cli
mcp-forge create my-server
```

## Templates

| Template | Description |
|----------|-------------|
| `minimal` | Minimal MCP server with echo tool |
| `rest-api` | REST API wrapper |
| `database` | Database operations (SQLite) |
| `filesystem` | File system operations |
| `web-scraper` | Web scraping with Cheerio |
| `ai-tool` | AI/LLM API wrapper (OpenAI) |

## Usage

### Create a project

```bash
mcp-forge create my-weather-server --template rest-api
```

### Add a tool

```bash
cd my-weather-server
mcp-forge add get-forecast
```

### Develop with hot reload

```bash
mcp-forge dev
```

### Inspect a server

```bash
mcp-forge inspect ./dist/index.js
```

## Generated Project

A generated MCP Forge project looks like:

```
my-server/
├── src/
│   ├── index.ts      # MCP Server entry
│   └── tools/        # Tool implementations
├── package.json
├── tsconfig.json
├── mcp-forge.config.ts
└── README.md
```

## Use with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/my-server/dist/index.js"]
    }
  }
}
```

## License

MIT
