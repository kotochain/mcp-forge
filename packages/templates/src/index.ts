import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type { TemplateInfo, TemplateManifest } from './types.js';

export type { TemplateInfo, TemplateManifest } from './types.js';

const TEMPLATES_DIR = join(dirname(new URL(import.meta.url).pathname), '..', 'templates');

export async function listTemplates(): Promise<TemplateInfo[]> {
  const entries = await readdir(TEMPLATES_DIR, { withFileTypes: true });
  const templates: TemplateInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    try {
      const manifestPath = join(TEMPLATES_DIR, entry.name, 'template.json');
      const content = await readFile(manifestPath, 'utf-8');
      const manifest: TemplateManifest = JSON.parse(content);

      templates.push({
        name: manifest.name,
        description: manifest.description,
        category: manifest.category,
        path: join(TEMPLATES_DIR, entry.name),
      });
    } catch {
      // Skip invalid templates
    }
  }

  return templates;
}

export async function getTemplate(name: string): Promise<TemplateInfo | null> {
  const templates = await listTemplates();
  return templates.find((t) => t.name === name) ?? null;
}

export function getTemplatesDir(): string {
  return TEMPLATES_DIR;
}
