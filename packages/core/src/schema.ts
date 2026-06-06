import { z } from 'zod/v3';

export const ToolParameterSchema: z.ZodTypeAny = z.object({
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  description: z.string().optional(),
  items: z.lazy(() => ToolParameterSchema).optional(),
  properties: z.record(z.lazy(() => ToolParameterSchema)).optional(),
  required: z.array(z.string()).optional(),
  default: z.unknown().optional(),
});

export const ToolDefinitionSchema = z.object({
  name: z.string().min(1, 'Tool name is required'),
  description: z.string().min(1, 'Tool description is required'),
  parameters: z.object({
    type: z.literal('object'),
    properties: z.record(ToolParameterSchema).default({}),
    required: z.array(z.string()).default([]),
  }).default({ type: 'object', properties: {}, required: [] }),
});

export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
export type ToolParameter = z.infer<typeof ToolParameterSchema>;

export const ProjectConfigSchema = z.object({
  server: z.object({
    name: z.string().min(1),
    version: z.string().default('1.0.0'),
    description: z.string().optional(),
  }),
  tools: z.array(z.string()).default(['./src/tools/*.ts']),
  dev: z.object({
    watch: z.array(z.string()).default(['./src']),
    hotReload: z.boolean().default(true),
  }).default({}),
  transport: z.enum(['stdio', 'streamable-http']).default('stdio'),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
