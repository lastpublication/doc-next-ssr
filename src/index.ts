export type {
  DocBlock,
  DocCodeBlock,
  DocDocument,
  DocHtmlBlock,
  DocListBlock,
  DocParagraphBlock,
  DocSection,
} from "./types";

export { DEFAULT_SSR_ID } from "./utils";

export { DocSSR } from "./DocSSR";
export type { DocSSRProps } from "./DocSSR";

// Note: client-only exports (DocClient, ClientOnly) are intentionally not
// re-exported from the package root to avoid pulling client hooks into the
// server-side bundle. Import them directly from their files when needed, for
// example:
//   import DocClient from 'doc-next-ssr/src/DocClient';
// or set up a dedicated client entry in your build.
