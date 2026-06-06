import { Command } from 'commander';
import { resolve } from 'node:path';
import pc from 'picocolors';
import { spawn, type ChildProcess } from 'node:child_process';
import { watch } from 'chokidar';

export function registerDevCommand(program: Command): void {
  program
    .command('dev')
    .description('Start MCP Server in development mode with hot reload')
    .option('-p, --project <path>', 'Project path', '.')
    .option('-w, --watch <paths>', 'Comma-separated watch paths', './src')
    .action(async (options: { project: string; watch: string }) => {
      const projectPath = resolve(options.project);
      const watchPaths = options.watch.split(',').map((p: string) => p.trim());

      console.log(pc.cyan(`MCP Forge Dev - ${pc.bold(projectPath)}`));
      console.log(pc.dim(`Watching: ${watchPaths.join(', ')}\n`));

      let serverProcess: ChildProcess | null = null;

      async function buildAndStart() {
        // Stop existing server
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill('SIGTERM');
          serverProcess = null;
        }

        console.log(pc.yellow('Building...'));
        try {
          const { execa } = await import('execa');
          await execa('npm', ['run', 'build'], { cwd: projectPath, stdio: 'pipe' });
          console.log(pc.green('Build successful. Starting server...'));
        } catch (error) {
          console.log(pc.red(`Build failed: ${error instanceof Error ? error.message : String(error)}`));
          return;
        }

        const entryPoint = resolve(projectPath, 'dist', 'index.js');
        serverProcess = spawn('node', [entryPoint], {
          cwd: projectPath,
          stdio: 'inherit',
        });

        serverProcess.on('exit', (code) => {
          if (code !== null && code !== 0) {
            console.log(pc.red(`Server exited with code ${code}`));
          }
        });
      }

      // Initial build and start
      await buildAndStart();

      // Set up file watcher
      const watcher = watch(watchPaths.map((p) => `${projectPath}/${p}`), {
        ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
        persistent: true,
        ignoreInitial: true,
      });

      watcher.on('change', async (path) => {
        console.log(pc.cyan(`\nFile changed: ${path}`));
        await buildAndStart();
      });

      // Handle process exit
      process.on('SIGINT', () => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill('SIGTERM');
        }
        watcher.close();
        process.exit(0);
      });

      console.log(pc.dim('\nPress Ctrl+C to stop'));
    });
}
