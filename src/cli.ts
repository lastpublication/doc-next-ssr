#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import { DocGenerator } from './core/doc-generator';
import { DocGeneratorConfig } from './types';

const program = new Command();

program
  .name('doc-next-ssr')
  .description('Generate documentation for Next.js applications with SSR and client-side rendering support')
  .version('0.1.0');

program
  .command('generate')
  .alias('gen')
  .description('Generate documentation for Next.js components')
  .option('-s, --source <dir>', 'Source directory to scan', './src')
  .option('-o, --output <dir>', 'Output directory for documentation', './docs')
  .option('--no-ssr', 'Exclude SSR-specific documentation')
  .option('--no-client', 'Exclude client-side specific documentation')
  .option('-p, --pattern <pattern>', 'File pattern to match', '**/*.{tsx,jsx,ts,js}')
  .option('-e, --exclude <patterns...>', 'Exclude patterns', ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*'])
  .option('-t, --template <type>', 'Template type', 'default')
  .action(async (options) => {
    try {
      const config: DocGeneratorConfig = {
        sourceDir: path.resolve(options.source),
        outputDir: path.resolve(options.output),
        includeSSR: options.ssr !== false,
        includeClient: options.client !== false,
        filePattern: options.pattern,
        excludePatterns: options.exclude,
        template: options.template
      };

      console.log('🚀 Starting documentation generation...');
      console.log(`📂 Source: ${config.sourceDir}`);
      console.log(`📝 Output: ${config.outputDir}`);
      console.log(`🔍 Pattern: ${config.filePattern}`);
      console.log(`📋 Template: ${config.template}`);
      
      const generator = new DocGenerator(config);
      const outputs = await generator.generate();
      
      console.log(`✨ Generated ${outputs.length} documentation files`);
      
      if (outputs.length === 0) {
        console.log('💡 Try adjusting your source directory or file pattern to find components');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error generating documentation:', error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize documentation configuration')
  .action(async () => {
    try {
      console.log('🔧 Creating doc-next-ssr configuration...');
      
      const configContent = `module.exports = {
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
};`;

      const fs = await import('fs');
      fs.writeFileSync('doc-next-ssr.config.js', configContent);
      console.log('✅ Configuration file created: doc-next-ssr.config.js');
      console.log('📝 Edit the configuration file to customize your documentation generation');
    } catch (error) {
      console.error('❌ Error creating configuration:', error);
      process.exit(1);
    }
  });

// Help command
program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(`
📚 doc-next-ssr - Documentation Generator for Next.js

🚀 Quick Start:
  npx doc-next-ssr generate              # Generate docs with default settings
  npx doc-next-ssr generate -s ./app     # Generate docs from ./app directory
  npx doc-next-ssr init                  # Create configuration file

📋 Templates:
  - default: Comprehensive documentation with all features
  - minimal: Simple, clean documentation
  - detailed: Extensive documentation with integration notes

🔍 File Patterns:
  Use glob patterns to match files:
  - **/*.tsx          # All .tsx files recursively
  - src/components/** # All files in components directory
  - pages/**/*.tsx    # All .tsx files in pages directory

📖 Examples:
  doc-next-ssr generate --source ./app --output ./documentation
  doc-next-ssr generate --template minimal --no-ssr
  doc-next-ssr generate --pattern "**/*.tsx" --exclude "**/test/**"

For more information, visit: https://github.com/lastpublication/doc-next-ssr
`);
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (process.argv.length <= 2) {
  program.help();
}