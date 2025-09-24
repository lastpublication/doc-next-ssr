import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { ComponentInfo, DocGeneratorConfig } from '../types';

export class FileScanner {
  constructor(private config: DocGeneratorConfig) {}

  /**
   * Scan directory for React/Next.js components
   */
  async scanForComponents(): Promise<ComponentInfo[]> {
    const pattern = path.join(this.config.sourceDir, this.config.filePattern);
    const files = await glob(pattern, {
      ignore: this.config.excludePatterns
    });

    const components: ComponentInfo[] = [];

    for (const filePath of files) {
      const componentInfo = await this.analyzeComponent(filePath);
      if (componentInfo) {
        components.push(componentInfo);
      }
    }

    return components;
  }

  /**
   * Analyze a single component file
   */
  private async analyzeComponent(filePath: string): Promise<ComponentInfo | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const name = this.extractComponentName(filePath, content);
      const type = this.determineComponentType(filePath);
      
      return {
        name,
        filePath,
        type,
        props: this.extractProps(content),
        supportsSSR: this.detectSSRSupport(content),
        supportsClient: this.detectClientSupport(content),
        description: this.extractDescription(content),
        examples: this.extractExamples(content)
      };
    } catch (error) {
      console.warn(`Failed to analyze component ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract component name from file path and content
   */
  private extractComponentName(filePath: string, content: string): string {
    // Try to extract from export default
    const exportMatch = content.match(/export\s+default\s+(?:function\s+)?(\w+)/);
    if (exportMatch) {
      return exportMatch[1];
    }

    // Fallback to filename
    const filename = path.basename(filePath, path.extname(filePath));
    return filename === 'index' 
      ? path.basename(path.dirname(filePath))
      : filename;
  }

  /**
   * Determine component type based on file location
   */
  private determineComponentType(filePath: string): ComponentInfo['type'] {
    if (filePath.includes('/pages/') || filePath.includes('/app/')) {
      if (filePath.includes('/api/')) {
        return 'api';
      }
      return 'page';
    }
    if (filePath.includes('layout')) {
      return 'layout';
    }
    return 'component';
  }

  /**
   * Extract props information from component
   */
  private extractProps(content: string) {
    // Basic prop extraction - could be enhanced with TypeScript AST parsing
    const propsMatch = content.match(/interface\s+\w*Props\s*\{([^}]+)\}/s);
    if (!propsMatch) return [];

    const propsContent = propsMatch[1];
    const propLines = propsContent.split('\n').filter(line => line.trim());
    
    return propLines.map(line => {
      const propMatch = line.match(/(\w+)(\?)?:\s*([^;]+)/);
      if (!propMatch) return null;

      return {
        name: propMatch[1],
        type: propMatch[3].trim(),
        required: !propMatch[2],
        description: this.extractPropDescription(line)
      };
    }).filter(Boolean) as any[];
  }

  /**
   * Extract prop description from comment
   */
  private extractPropDescription(line: string): string | undefined {
    const commentMatch = line.match(/\/\*\*\s*([^*]+)\s*\*\//);
    return commentMatch ? commentMatch[1].trim() : undefined;
  }

  /**
   * Detect if component supports SSR
   */
  private detectSSRSupport(content: string): boolean {
    return content.includes('getServerSideProps') ||
           content.includes('getStaticProps') ||
           content.includes('getStaticPaths') ||
           !content.includes('use client');
  }

  /**
   * Detect if component supports client-side rendering
   */
  private detectClientSupport(content: string): boolean {
    return content.includes('useState') ||
           content.includes('useEffect') ||
           content.includes('use client') ||
           content.includes('onClick') ||
           content.includes('onChange');
  }

  /**
   * Extract component description from JSDoc comments
   */
  private extractDescription(content: string): string | undefined {
    const descMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^@\n][^\n]*(?:\n\s*\*\s*[^@\n][^\n]*)*)/);
    return descMatch ? descMatch[1].replace(/\n\s*\*\s*/g, ' ').trim() : undefined;
  }

  /**
   * Extract usage examples from comments
   */
  private extractExamples(content: string): string[] {
    const exampleMatches = content.match(/@example\s+([^@]*)/g);
    return exampleMatches ? exampleMatches.map(match => 
      match.replace('@example', '').trim()
    ) : [];
  }
}