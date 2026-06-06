import * as clack from '@clack/prompts';
import type { ToolDefinition } from 'mcp-forge-core';
import { listTemplates } from 'mcp-forge-templates';

export interface CreateAnswers {
  projectName: string;
  description: string;
  author: string;
  template: string;
  tools: ToolDefinition[];
}

export async function runCreatePrompts(options: Partial<CreateAnswers> = {}): Promise<CreateAnswers | null> {
  clack.intro('Welcome to MCP Forge!');

  const templates = await listTemplates();

  const answers = await clack.group({
    projectName: () =>
      clack.text({
        message: 'Project name?',
        placeholder: 'my-mcp-server',
        defaultValue: 'my-mcp-server',
        validate: (v: string) => (!v.trim() ? 'Project name is required' : undefined),
      }),
    description: () =>
      clack.text({
        message: 'Description?',
        placeholder: 'My MCP Server',
      }),
    author: () =>
      clack.text({
        message: 'Author?',
        placeholder: 'Your Name',
      }),
    template: () =>
      clack.select({
        message: 'Choose a template',
        options: templates.map((t) => ({
          value: t.name,
          label: t.name,
          hint: t.description,
        })),
      }),
    addTools: () =>
      clack.confirm({
        message: 'Add custom tools now?',
        initialValue: true,
      }),
  });

  if (clack.isCancel(answers)) {
    clack.cancel('Operation cancelled');
    return null;
  }

  let tools: ToolDefinition[] = [];

  if (answers.addTools) {
    tools = await collectToolDefinitions();
  }

  clack.outro('Project ready!');

  return {
    projectName: options.projectName || (answers.projectName as string),
    description: options.description || (answers.description as string) || '',
    author: options.author || (answers.author as string) || '',
    template: options.template || (answers.template as string),
    tools,
  };
}

async function collectToolDefinitions(): Promise<ToolDefinition[]> {
  const tools: ToolDefinition[] = [];
  let addMore = true;

  while (addMore) {
    const toolAnswers = await clack.group({
      name: () =>
        clack.text({
          message: 'Tool name?',
          placeholder: 'search',
          validate: (v: string) => (!v.trim() ? 'Tool name is required' : undefined),
        }),
      description: () =>
        clack.text({
          message: 'Tool description?',
          placeholder: 'Search for items',
        }),
      addParams: () =>
        clack.confirm({
          message: 'Add parameters?',
          initialValue: true,
        }),
    });

    if (clack.isCancel(toolAnswers)) break;

    const parameters: ToolDefinition['parameters'] = {
      type: 'object',
      properties: {},
      required: [],
    };

    if (toolAnswers.addParams) {
      let addMoreParams = true;
      while (addMoreParams) {
        const paramAnswers = await clack.group({
          paramName: () =>
            clack.text({
              message: 'Parameter name?',
              placeholder: 'query',
            }),
          paramType: () =>
            clack.select({
              message: 'Parameter type?',
              options: [
                { value: 'string', label: 'string' },
                { value: 'number', label: 'number' },
                { value: 'boolean', label: 'boolean' },
                { value: 'array', label: 'array' },
              ],
            }),
          paramDesc: () =>
            clack.text({
              message: 'Parameter description?',
              placeholder: 'Search query',
            }),
          paramRequired: () =>
            clack.confirm({
              message: 'Required?',
              initialValue: true,
            }),
          addMoreParams: () =>
            clack.confirm({
              message: 'Add another parameter?',
              initialValue: false,
            }),
        });

        if (clack.isCancel(paramAnswers)) break;

        const pName = paramAnswers.paramName as string;
        if (pName) {
          parameters.properties![pName] = {
            type: paramAnswers.paramType as 'string' | 'number' | 'boolean' | 'array',
            description: (paramAnswers.paramDesc as string) || undefined,
          };
          if (paramAnswers.paramRequired) {
            parameters.required!.push(pName);
          }
        }

        addMoreParams = paramAnswers.addMoreParams as boolean;
      }
    }

    tools.push({
      name: toolAnswers.name as string,
      description: (toolAnswers.description as string) || '',
      parameters,
    });

    const moreTools = await clack.confirm({
      message: 'Add another tool?',
      initialValue: false,
    });
    addMore = clack.isCancel(moreTools) ? false : (moreTools as boolean);
  }

  return tools;
}
