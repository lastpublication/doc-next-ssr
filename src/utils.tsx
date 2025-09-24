import type {
  DocBlock,
  DocDocument,
  DocSection,
  FlattenedSection,
} from "./types";

export const DEFAULT_SSR_ID = "doc-ssr-root";

export function normalizeLevel(level?: number): number {
  if (!level) return 2;
  if (level < 1) return 1;
  if (level > 6) return 6;
  return Math.round(level);
}

export function resolveSectionLevel(
  section: DocSection,
  parentLevel?: number
): number {
  const fallback = typeof parentLevel === "number" ? parentLevel + 1 : 2;
  return normalizeLevel(section.level ?? fallback);
}

export function flattenSections(doc: DocDocument): FlattenedSection[] {
  const list: FlattenedSection[] = [];

  const walk = (sections: DocSection[], parentLevel?: number) => {
    for (const section of sections) {
      const level = resolveSectionLevel(section, parentLevel);
      list.push({ id: section.id, title: section.title, level });
      if (section.children?.length) {
        walk(section.children, level);
      }
    }
  };

  walk(doc.sections);
  return list;
}

export function renderBlock(block: DocBlock, key: number): JSX.Element {
  if (typeof block === "string") {
    return <p key={key}>{block}</p>;
  }

  switch (block.kind) {
    case "paragraph":
      return <p key={key}>{block.text}</p>;
    case "list":
      if (!block.items.length) {
        return <></>;
      }
      if (block.ordered) {
        return (
          <ol key={key} className="list-decimal pl-6 space-y-1">
            {block.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={key} className="list-disc pl-6 space-y-1">
          {block.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre
          key={key}
          className="dark:bg-stone-950 border bg-stone-200 border-gray-300 dark:border-stone-800 dark:text-stone-50 text-stone-950 shadow-sm rounded-lg p-4 overflow-auto text-sm"
        >
          <code
            className={
              block.language ? `language-${block.language}` : undefined
            }
          >
            {block.code}
          </code>
        </pre>
      );
    case "html":
      return <div key={key} dangerouslySetInnerHTML={{ __html: block.html }} />;
    default:
      return <></>;
  }
}

export function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (typeof value === "undefined") return [];
  return Array.isArray(value) ? value : [value];
}
