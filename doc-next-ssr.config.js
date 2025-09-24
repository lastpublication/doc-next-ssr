module.exports = {
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