import { Command } from 'commander';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import pc from 'picocolors';
import { resolve } from 'node:path';

export function registerInspectCommand(program: Command): void {
  program
    .command('inspect <path>')
    .description('Inspect a running MCP Server or start one and inspect it')
    .option('-a, --args <args>', 'Additional arguments to pass to the server', '')
    .action(async (serverPath: string, options: { args?: string }) => {
      const absolutePath = resolve(serverPath);

      console.log(pc.cyan(`Inspecting MCP Server: ${pc.bold(absolutePath)}\n`));

      try {
        const transport = new StdioClientTransport({
          command: 'node',
          args: [absolutePath, ...(options.args ? options.args.split(' ') : [])],
        });

        const client = new Client({
          name: 'mcp-forge-inspector',
          version: '0.1.0',
        });

        await client.connect(transport);

        // List tools
        console.log(pc.bold(pc.cyan('Tools:')));
        const toolsResult = await client.listTools();
        if (toolsResult.tools.length === 0) {
          console.log(pc.dim('  No tools registered'));
        } else {
          for (const tool of toolsResult.tools) {
            console.log(`  ${pc.green(tool.name)} - ${tool.description || pc.dim('No description')}`);
            if (tool.inputSchema && typeof tool.inputSchema === 'object' && 'properties' in tool.inputSchema) {
              const props = (tool.inputSchema as { properties: Record<string, unknown> }).properties;
              for (const [key, value] of Object.entries(props)) {
                const v = value as { type?: string; description?: string };
                console.log(pc.dim(`    ${key}: ${v.type || 'any'}${v.description ? ` - ${v.description}` : ''}`));
              }
            }
          }
        }

        // List resources
        console.log(pc.bold(pc.cyan('\nResources:')));
        try {
          const resourcesResult = await client.listResources();
          if (resourcesResult.resources.length === 0) {
            console.log(pc.dim('  No resources registered'));
          } else {
            for (const resource of resourcesResult.resources) {
              console.log(`  ${pc.green(resource.name)} - ${resource.uri}`);
            }
          }
        } catch {
          console.log(pc.dim('  Resources not supported'));
        }

        // List prompts
        console.log(pc.bold(pc.cyan('\nPrompts:')));
        try {
          const promptsResult = await client.listPrompts();
          if (promptsResult.prompts.length === 0) {
            console.log(pc.dim('  No prompts registered'));
          } else {
            for (const prompt of promptsResult.prompts) {
              console.log(`  ${pc.green(prompt.name)} - ${prompt.description || pc.dim('No description')}`);
            }
          }
        } catch {
          console.log(pc.dim('  Prompts not supported'));
        }

        await client.close();
        console.log(pc.dim('\nInspection complete.'));
      } catch (error) {
        console.error(pc.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });
}
