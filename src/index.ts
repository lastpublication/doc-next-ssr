// Main library exports
export { DocGenerator } from './core/doc-generator';
export { TemplateRenderer } from './core/template-renderer';
export { FileScanner } from './utils/file-scanner';

// Type exports
export type {
  DocGeneratorConfig,
  ComponentInfo,
  PropInfo,
  DocumentationOutput
} from './types';

import { DocGeneratorConfig } from './types';

// Default configuration
export const defaultConfig: Partial<DocGeneratorConfig> = {
  sourceDir: './src',
  outputDir: './docs',
  includeSSR: true,
  includeClient: true,
  filePattern: '**/*.{tsx,jsx,ts,js}',
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.test.*',
    '**/*.spec.*'
  ],
  template: 'default'
};

/**
 * Quick generate function for programmatic usage
 */
export async function generateDocs(config: Partial<DocGeneratorConfig> = {}) {
  const { DocGenerator } = await import('./core/doc-generator');
  
  const fullConfig: DocGeneratorConfig = {
    ...defaultConfig,
    ...config
  } as DocGeneratorConfig;

  const generator = new DocGenerator(fullConfig);
  return await generator.generate();
}