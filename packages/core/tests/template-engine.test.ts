import { describe, it, expect } from 'vitest';
import { renderTemplate } from '../src/template-engine.js';

describe('renderTemplate', () => {
  it('renders a simple template with variables', () => {
    const template = 'Hello {{name}}!';
    const result = renderTemplate(template, { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('renders tool definitions in a loop', () => {
    const template = '{{#each tools}}  {{name}}: {{description}}\n{{/each}}';
    const result = renderTemplate(template, {
      tools: [
        { name: 'search', description: 'Search items' },
        { name: 'create', description: 'Create items' },
      ],
    });
    expect(result).toContain('search: Search items');
    expect(result).toContain('create: Create items');
  });

  it('converts camelCase to kebab-case via helper', () => {
    const template = '{{kebabCase name}}';
    const result = renderTemplate(template, { name: 'myCoolTool' });
    expect(result).toBe('my-cool-tool');
  });

  it('converts to PascalCase via helper', () => {
    const template = '{{pascalCase name}}';
    const result = renderTemplate(template, { name: 'my-cool-tool' });
    expect(result).toBe('MyCoolTool');
  });
});
