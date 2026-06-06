import { Command } from 'commander';
import { registerCreateCommand } from './commands/create.js';
import { registerAddCommand } from './commands/add.js';
import { registerDevCommand } from './commands/dev.js';
import { registerInspectCommand } from './commands/inspect.js';

const program = new Command();

program
  .name('mcp-forge')
  .description('The fastest way to build MCP Servers')
  .version('0.1.0');

registerCreateCommand(program);
registerAddCommand(program);
registerDevCommand(program);
registerInspectCommand(program);

program
  .command('test')
  .description('Run tests against your MCP Server')
  .action(() => {
    console.log('mcp-forge test - Coming soon!');
  });

program.parse();
