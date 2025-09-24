export interface DocGeneratorConfig {
  /** Source directory to scan for components */
  sourceDir: string;
  /** Output directory for generated documentation */
  outputDir: string;
  /** Include SSR-specific documentation */
  includeSSR: boolean;
  /** Include client-side specific documentation */
  includeClient: boolean;
  /** Pattern to match component files */
  filePattern: string;
  /** Exclude patterns */
  excludePatterns: string[];
  /** Template to use for documentation */
  template: 'default' | 'minimal' | 'detailed';
}

export interface ComponentInfo {
  /** Component name */
  name: string;
  /** File path */
  filePath: string;
  /** Component type (page, component, etc.) */
  type: 'page' | 'component' | 'layout' | 'api';
  /** Props interface if available */
  props?: PropInfo[];
  /** Whether component supports SSR */
  supportsSSR: boolean;
  /** Whether component supports client-side rendering */
  supportsClient: boolean;
  /** Documentation comments */
  description?: string;
  /** Examples */
  examples?: string[];
}

export interface PropInfo {
  /** Property name */
  name: string;
  /** Property type */
  type: string;
  /** Is required */
  required: boolean;
  /** Default value */
  defaultValue?: string;
  /** Description */
  description?: string;
}

export interface DocumentationOutput {
  /** Generated markdown content */
  markdown: string;
  /** Component information */
  component: ComponentInfo;
  /** Output file path */
  outputPath: string;
}