import { Command } from 'commander';
import { runAddPrompts } from '../prompts/add-prompts.js';
import pc from 'picocolors';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { renderTemplate } from 'mcp-forge-core';
import type { ToolDefinition } from 'mcp-forge-core';

const TOOL_TEMPLATE = `import { z } from 'zod/v3';

export function register{{pascalCase name}}(server: import('@modelcontextprotocol/sdk/server/mcp.js').McpServer) {
  server.tool(
    '{{name}}',
    '{{description}}',
    {
      {{#each parameters.properties}}
      {{@key}}: z.{{zodType this}}(){{#if this.description}}.describe('{{this.description}}'){{/if}},
      {{/each}}
    },
    async ({ {{parameterList}} }) => {
      // TODO: Implement {{name}} tool logic
      return {
        content: [{ type: 'text', text: JSON.stringify({ result: '{{name}} executed' }) }],
      };
    }
  );
}
`;

export function registerAddCommand(program: Command): void {
  program
    .command('add [tool-name]')
    .description('Add a new tool to your MCP Forge project')
    .action(async (toolName?: string) => {
      const toolDef = await runAddPrompts(toolName);

      if (!toolDef) {
        process.exit(1);
      }

      const projectPath = process.cwd();

      const paramNames = Object.keys(toolDef.parameters.properties || {});
      const templateData = {
        ...toolDef,
        parameterList: paramNames.join(', '),
        parameters: {
          ...toolDef.parameters,
          properties: Object.fromEntries(
            Object.entries(toolDef.parameters.properties || {}).map(([key, val]) => [
              key,
              { ...val, zodType: zodTypeFromSchema(val as { type: string }) },
            ])
          ),
        },
      };

      const content = renderTemplate(TOOL_TEMPLATE, templateData);
      const toolPath = join(projectPath, 'src', 'tools', `${toolDef.name}.ts`);

      await mkdir(dirname(toolPath), { recursive: true });
      await writeFile(toolPath, content, 'utf-8');

      // Update index.ts
      const indexPath = join(projectPath, 'src', 'index.ts');
      try {
        let indexContent = await readFile(indexPath, 'utf-8');

        const importLine = `import { register${toPascalCase(toolDef.name)} } from './tools/${toolDef.name}.js';`;
        if (!indexContent.includes(importLine)) {
          const lastImportIndex = indexContent.lastIndexOf('import ');
          const lineEnd = indexContent.indexOf('\n', lastImportIndex);
          indexContent =
            indexContent.slice(0, lineEnd + 1) +
            importLine +
            '\n' +
            indexContent.slice(lineEnd + 1);
        }

        const regLine = `register${toPascalCase(toolDef.name)}(server);`;
        if (!indexContent.includes(regLine)) {
          const mainIndex = indexContent.indexOf('async function main()');
          if (mainIndex !== -1) {
            indexContent =
              indexContent.slice(0, mainIndex) +
              regLine +
              '\n\n' +
              indexContent.slice(mainIndex);
          }
        }

        await writeFile(indexPath, indexContent, 'utf-8');
      } catch {
        console.log(pc.yellow('Warning: Could not update index.ts. Add the import manually.'));
      }

      console.log(pc.green(`\nTool ${pc.bold(toolDef.name)} added!`));
      console.log(pc.dim(`  Created: src/tools/${toolDef.name}.ts`));
      console.log(pc.dim(`  Updated: src/index.ts`));
    });
}

function toPascalCase(str: string): string {
  return str
    .replace(/(^|[-_\s])(\w)/g, (_match, _sep, char: string) => char.toUpperCase())
    .replace(/[-_\s]/g, '');
}

function zodTypeFromSchema(param: { type: string }): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    array: 'array',
    object: 'object',
  };
  return typeMap[param.type] || 'string';
}
