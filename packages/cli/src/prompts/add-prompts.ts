import * as clack from '@clack/prompts';
import type { ToolDefinition } from 'mcp-forge-core';

export async function runAddPrompts(toolName?: string): Promise<ToolDefinition | null> {
  const answers = await clack.group({
    name: () =>
      clack.text({
        message: 'Tool name?',
        placeholder: toolName || 'my-tool',
        defaultValue: toolName,
        validate: (v: string) => (!v.trim() ? 'Tool name is required' : undefined),
      }),
    description: () =>
      clack.text({
        message: 'Tool description?',
        placeholder: 'What does this tool do?',
      }),
    addParams: () =>
      clack.confirm({
        message: 'Add parameters?',
        initialValue: true,
      }),
  });

  if (clack.isCancel(answers)) {
    clack.cancel('Operation cancelled');
    return null;
  }

  const parameters: ToolDefinition['parameters'] = {
    type: 'object',
    properties: {},
    required: [],
  };

  if (answers.addParams) {
    let addMore = true;
    while (addMore) {
      const paramAnswers = await clack.group({
        paramName: () =>
          clack.text({ message: 'Parameter name?', placeholder: 'query' }),
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
          clack.text({ message: 'Parameter description?' }),
        paramRequired: () =>
          clack.confirm({ message: 'Required?', initialValue: true }),
        addMore: () =>
          clack.confirm({ message: 'Add another parameter?', initialValue: false }),
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

      addMore = paramAnswers.addMore as boolean;
    }
  }

  return {
    name: answers.name as string,
    description: (answers.description as string) || '',
    parameters,
  };
}
