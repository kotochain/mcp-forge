export interface TemplateManifest {
  name: string;
  description: string;
  category: 'minimal' | 'api' | 'data' | 'web' | 'ai';
  dependencies?: Record<string, string>;
  prompts?: TemplatePrompt[];
}

export interface TemplatePrompt {
  name: string;
  message: string;
  type: 'text' | 'select' | 'confirm';
  default?: string | boolean;
  choices?: { name: string; value: string }[];
}

export interface TemplateInfo {
  name: string;
  description: string;
  category: string;
  path: string;
}
