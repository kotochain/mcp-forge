import Handlebars from 'handlebars';

export function registerHelpers(): void {
  Handlebars.registerHelper('kebabCase', (str: string) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  });

  Handlebars.registerHelper('pascalCase', (str: string) => {
    return str
      .replace(/(^|[-_\s])(\w)/g, (_match, _sep, char) => char.toUpperCase())
      .replace(/[-_\s]/g, '');
  });

  Handlebars.registerHelper('camelCase', (str: string) => {
    const pascal = str
      .replace(/(^|[-_\s])(\w)/g, (_match: string, _sep: string, char: string) => char.toUpperCase())
      .replace(/[-_\s]/g, '');
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  });

  Handlebars.registerHelper('json', (obj: unknown) => {
    return new Handlebars.SafeString(JSON.stringify(obj, null, 2));
  });

  Handlebars.registerHelper('zodType', (param: { type: string }) => {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      array: 'array',
      object: 'object',
    };
    return typeMap[param.type] || 'string';
  });
}

registerHelpers();

export function renderTemplate(template: string, data: Record<string, unknown>): string {
  const compiled = Handlebars.compile(template);
  return compiled(data);
}
