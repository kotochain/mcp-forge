import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { renderTemplate } from './template-engine.js';
import type { ToolDefinition } from './schema.js';

export interface GenerateProjectOptions {
  projectName: string;
  description: string;
  author: string;
  template: string;
  tools: ToolDefinition[];
  outputPath: string;
}

interface TemplateFile {
  path: string;
  content: string;
  isTemplate: boolean;
}

async function ensureDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

export async function generateProject(options: GenerateProjectOptions): Promise<void> {
  const { projectName, description, author, template, tools, outputPath } = options;

  const templateDir = await resolveTemplateDir(template);
  const files = await loadTemplateFiles(templateDir);

  const templateData = {
    projectName,
    description,
    author,
    tools,
    serverName: projectName,
    version: '1.0.0',
    hasTools: tools.length > 0,
    transport: 'stdio',
  };

  for (const file of files) {
    const targetPath = join(outputPath, file.path.replace('.hbs', ''));
    await ensureDir(targetPath);

    let content: string;
    if (file.isTemplate) {
      content = renderTemplate(file.content, templateData);
    } else {
      content = file.content;
    }

    await writeFile(targetPath, content, 'utf-8');
  }

  // Generate tool files
  if (tools.length > 0) {
    await generateToolFiles(outputPath, tools, templateDir);
  }

  // Generate config file
  await generateConfigFile(outputPath, projectName, description);

  // Generate tsup config
  await generateTsupConfig(outputPath);
}

async function resolveTemplateDir(templateName: string): Promise<string> {
  const builtInPath = join(
    dirname(new URL(import.meta.url).pathname),
    '../../templates/templates',
    templateName
  );

  try {
    await readFile(join(builtInPath, 'template.json'), 'utf-8');
    return builtInPath;
  } catch {
    throw new Error(`Template "${templateName}" not found`);
  }
}

async function loadTemplateFiles(templateDir: string): Promise<TemplateFile[]> {
  const files: TemplateFile[] = [];

  async function walk(dir: string, relativePath: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = join(relativePath, entry.name);

      if (entry.name === 'template.json') continue;

      if (entry.isDirectory()) {
        await walk(fullPath, relPath);
      } else {
        const content = await readFile(fullPath, 'utf-8');
        const isTemplate = entry.name.endsWith('.hbs');
        files.push({ path: relPath, content, isTemplate });
      }
    }
  }

  await walk(templateDir, '');
  return files;
}

async function generateToolFiles(
  outputPath: string,
  tools: ToolDefinition[],
  templateDir: string
): Promise<void> {
  let toolTemplate: string;
  try {
    toolTemplate = await readFile(join(templateDir, 'src', 'tools', '_tool.ts.hbs'), 'utf-8');
  } catch {
    toolTemplate = `import { z } from 'zod/v3';

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
  }

  for (const tool of tools) {
    const paramNames = Object.keys(tool.parameters.properties || {});
    const templateData = {
      ...tool,
      projectName: '',
      parameterList: paramNames.join(', '),
      parameters: {
        ...tool.parameters,
        properties: Object.fromEntries(
          Object.entries(tool.parameters.properties || {}).map(([key, val]) => [
            key,
            { ...val, zodType: zodTypeFromSchema(val as { type: string }) },
          ])
        ),
      },
    };

    const content = renderTemplate(toolTemplate, templateData);
    const toolPath = join(outputPath, 'src', 'tools', `${tool.name}.ts`);
    await ensureDir(toolPath);
    await writeFile(toolPath, content, 'utf-8');
  }
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

async function generateConfigFile(
  outputPath: string,
  projectName: string,
  description: string
): Promise<void> {
  const configContent = `import { defineConfig } from 'mcp-forge-core';

export default defineConfig({
  server: {
    name: '${projectName}',
    version: '1.0.0',
    ${description ? `description: '${description}',` : ''}
  },
  tools: ['./src/tools/*.ts'],
  dev: {
    watch: ['./src'],
    hotReload: true,
  },
});
`;

  const configPath = join(outputPath, 'mcp-forge.config.ts');
  await writeFile(configPath, configContent, 'utf-8');
}

async function generateTsupConfig(outputPath: string): Promise<void> {
  const tsupContent = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  sourcemap: true,
});
`;

  const tsupPath = join(outputPath, 'tsup.config.ts');
  await writeFile(tsupPath, tsupContent, 'utf-8');
}
