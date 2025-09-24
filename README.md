# doc-next-ssr

[![npm version](https://badge.fury.io/js/doc-next-ssr.svg)](https://badge.fury.io/js/doc-next-ssr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Easily generate comprehensive documentation for Next.js applications with both Server-Side Rendering (SSR) and Client-Side Rendering support.

## Features

- 🚀 **Easy to use**: Simple CLI interface with minimal configuration
- 📖 **Comprehensive docs**: Generates detailed documentation for components and pages
- 🔄 **SSR & Client detection**: Automatically detects SSR and client-side capabilities
- 🎨 **Multiple templates**: Choose from default, minimal, or detailed templates
- 📱 **TypeScript support**: Full TypeScript support with prop interface extraction
- 🔍 **Smart scanning**: Intelligent component analysis and prop extraction
- 📋 **Organized output**: Generates structured documentation with index files

## Installation

```bash
# Install globally
npm install -g doc-next-ssr

# Or use with npx
npx doc-next-ssr generate
```

## Quick Start

```bash
# Generate documentation with default settings
npx doc-next-ssr generate

# Generate from specific source directory
npx doc-next-ssr generate --source ./app --output ./documentation

# Use minimal template
npx doc-next-ssr generate --template minimal

# Create configuration file
npx doc-next-ssr init
```

## CLI Usage

### Commands

#### `generate` (alias: `gen`)
Generate documentation for Next.js components

```bash
doc-next-ssr generate [options]
```

**Options:**
- `-s, --source <dir>` - Source directory to scan (default: `./src`)
- `-o, --output <dir>` - Output directory for documentation (default: `./docs`)
- `--no-ssr` - Exclude SSR-specific documentation
- `--no-client` - Exclude client-side specific documentation
- `-p, --pattern <pattern>` - File pattern to match (default: `**/*.{tsx,jsx,ts,js}`)
- `-e, --exclude <patterns...>` - Exclude patterns (default: `['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']`)
- `-t, --template <type>` - Template type: `default`, `minimal`, `detailed` (default: `default`)

#### `init`
Initialize documentation configuration file

```bash
doc-next-ssr init
```

Creates a `doc-next-ssr.config.js` file in your project root.

#### `help`
Show help information

```bash
doc-next-ssr help
```

### Examples

```bash
# Basic usage
doc-next-ssr generate

# Custom source and output directories
doc-next-ssr generate --source ./app --output ./documentation

# Exclude SSR documentation, use minimal template
doc-next-ssr generate --no-ssr --template minimal

# Custom file patterns
doc-next-ssr generate --pattern "**/*.tsx" --exclude "**/test/**" "**/stories/**"
```

## Programmatic Usage

You can also use doc-next-ssr programmatically in your Node.js applications:

```javascript
import { generateDocs, DocGenerator } from 'doc-next-ssr';

// Quick generation with default config
const outputs = await generateDocs({
  sourceDir: './src',
  outputDir: './docs'
});

// Advanced usage with custom configuration
const generator = new DocGenerator({
  sourceDir: './app',
  outputDir: './documentation',
  includeSSR: true,
  includeClient: true,
  filePattern: '**/*.{tsx,jsx}',
  excludePatterns: ['**/node_modules/**', '**/*.test.*'],
  template: 'detailed'
});

const results = await generator.generate();
```

## Configuration

Create a `doc-next-ssr.config.js` file in your project root:

```javascript
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
```

## Templates

### Default Template
Comprehensive documentation with all features including:
- Component information (type, file path, SSR/client support)
- Props table with types and descriptions
- SSR and client-side rendering information
- Usage examples

### Minimal Template
Clean, simple documentation focusing on:
- Basic component information
- Props list
- Essential details only

### Detailed Template
Extensive documentation with:
- Complete component analysis
- TypeScript interface definitions
- Integration notes
- Comprehensive rendering information

## Component Analysis

doc-next-ssr automatically analyzes your components and detects:

### SSR Support Detection
- Components with `getServerSideProps` or `getStaticProps`
- Components without `'use client'` directive
- Server-compatible components

### Client-Side Detection  
- Components using React hooks (`useState`, `useEffect`)
- Components with `'use client'` directive
- Interactive components with event handlers

### Props Extraction
- TypeScript interface parsing
- JSDoc comment extraction
- Required/optional prop detection
- Default value identification

## Example Output

For a component like this:

```tsx
/**
 * A reusable button component with various styles
 */
interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Button style variant */
  variant?: 'primary' | 'secondary';
  /** Click handler */
  onClick?: () => void;
}

export default function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

doc-next-ssr generates:

```markdown
# Button

A reusable button component with various styles

## Component Information

- **Type**: component
- **File**: `./src/components/Button.tsx`
- **SSR Support**: ✅ Yes
- **Client-side**: ✅ Yes

## Props

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | `React.ReactNode` | ✅ | - | Button content |
| variant | `'primary' \| 'secondary'` | ❌ | 'primary' | Button style variant |
| onClick | `() => void` | ❌ | - | Click handler |
```

## Requirements

- Node.js >= 14.0.0
- Next.js >= 12.0.0 (peer dependency)
- React >= 17.0.0 (peer dependency)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Laurent Astruc
