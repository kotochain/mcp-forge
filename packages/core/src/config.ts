import { ProjectConfigSchema, type ProjectConfig } from './schema.js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export function defineConfig(config: ProjectConfig): ProjectConfig {
  return ProjectConfigSchema.parse(config);
}

export async function loadConfig(projectPath: string): Promise<ProjectConfig> {
  const configPath = resolve(projectPath, 'mcp-forge.config.ts');

  try {
    const moduleUrl = `file://${configPath}`;
    const module = await import(moduleUrl);
    const config = module.default || module;
    return ProjectConfigSchema.parse(config);
  } catch (error) {
    throw new Error(
      `Failed to load config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function createDefaultConfig(name: string, description?: string): ProjectConfig {
  return ProjectConfigSchema.parse({
    server: { name, description },
  });
}
