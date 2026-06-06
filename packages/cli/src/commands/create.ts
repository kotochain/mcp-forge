import { Command } from 'commander';
import { generateProject } from 'mcp-forge-core';
import { runCreatePrompts } from '../prompts/create-prompts.js';
import pc from 'picocolors';
import { execa } from 'execa';
import path from 'node:path';

export function registerCreateCommand(program: Command): void {
  program
    .command('create [name]')
    .description('Create a new MCP Server project')
    .option('-t, --template <template>', 'Template to use')
    .option('-d, --description <description>', 'Project description')
    .option('-a, --author <author>', 'Project author')
    .option('-y, --yes', 'Use defaults for all prompts')
    .action(async (name?: string, options?: { template?: string; description?: string; author?: string; yes?: boolean }) => {
      const answers = await runCreatePrompts({
        projectName: name,
        template: options?.template,
        description: options?.description,
        author: options?.author,
      });

      if (!answers) {
        process.exit(1);
      }

      const outputPath = path.resolve(process.cwd(), answers.projectName);

      console.log(pc.cyan(`\nCreating project ${pc.bold(answers.projectName)}...`));

      await generateProject({
        projectName: answers.projectName,
        description: answers.description,
        author: answers.author,
        template: answers.template,
        tools: answers.tools,
        outputPath,
      });

      // Install dependencies
      console.log(pc.cyan('Installing dependencies...'));
      try {
        await execa('npm', ['install'], { cwd: outputPath, stdio: 'inherit' });
      } catch {
        console.log(pc.yellow('Warning: npm install failed. Run it manually.'));
      }

      console.log(pc.green(`\nProject created at ${pc.bold(outputPath)}`));
      console.log(pc.dim('\nNext steps:'));
      console.log(pc.dim(`  cd ${answers.projectName}`));
      console.log(pc.dim('  npm run build'));
      console.log(pc.dim('  npm start'));
      console.log(pc.dim('\nTo inspect your server:'));
      console.log(pc.dim('  npm run inspect'));
    });
}
