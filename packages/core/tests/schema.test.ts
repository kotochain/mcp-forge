import { describe, it, expect } from 'vitest';
import { ToolDefinitionSchema, ProjectConfigSchema } from '../src/schema.js';

describe('ToolDefinitionSchema', () => {
  it('validates a minimal tool definition', () => {
    const tool = {
      name: 'search',
      description: 'Search for items',
      parameters: {
        type: 'object' as const,
        properties: {
          query: { type: 'string' as const, description: 'Search query' },
        },
        required: ['query'],
      },
    };
    const result = ToolDefinitionSchema.safeParse(tool);
    expect(result.success).toBe(true);
  });

  it('rejects tool without name', () => {
    const tool = {
      description: 'Search for items',
      parameters: { type: 'object' as const, properties: {} },
    };
    const result = ToolDefinitionSchema.safeParse(tool);
    expect(result.success).toBe(false);
  });
});

describe('ProjectConfigSchema', () => {
  it('validates a complete project config', () => {
    const config = {
      server: { name: 'my-server', version: '1.0.0' },
      tools: ['./src/tools/*.ts'],
      dev: { watch: ['./src'], hotReload: true },
    };
    const result = ProjectConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('provides defaults for optional fields', () => {
    const config = {
      server: { name: 'my-server', version: '1.0.0' },
    };
    const result = ProjectConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tools).toEqual(['./src/tools/*.ts']);
      expect(result.data.dev?.hotReload).toBe(true);
    }
  });
});
