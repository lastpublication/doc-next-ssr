export interface DocDocument {
  /**
   * Main title of the documentation. Rendered as the top-level <h1> element.
   */
  title: string;
  /**
   * Optional short description rendered as a paragraph under the title.
   */
  description?: string;
  /**
   * Sections that compose the documentation.
   */
  sections: DocSection[];
}

export type DocBlock =
  | string
  | DocParagraphBlock
  | DocListBlock
  | DocCodeBlock
  | DocHtmlBlock;

export interface DocParagraphBlock {
  kind: 'paragraph';
  text: string;
}

export interface DocListBlock {
  kind: 'list';
  ordered?: boolean;
  items: string[];
}

export interface DocCodeBlock {
  kind: 'code';
  code: string;
  language?: string;
}

export interface DocHtmlBlock {
  kind: 'html';
  html: string;
}

export interface DocSection {
  /**
   * Unique identifier used to generate anchors.
   */
  id: string;
  /**
   * Visible title of the section.
   */
  title: string;
  /**
   * Optional heading level from 2 to 6. Defaults to 2.
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Rich content blocks displayed inside the section.
   */
  content?: DocBlock[];
  /**
   * Nested subsections.
   */
  children?: DocSection[];
}

export interface FlattenedSection {
  id: string;
  title: string;
  level: number;
}

