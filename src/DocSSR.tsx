import type { DocCodeBlock, DocDocument, DocSection } from "./types";
import {
  DEFAULT_SSR_ID,
  flattenSections,
  renderBlock,
  resolveSectionLevel,
} from "./utils";
// DocClient intentionally not imported here to keep this module server-only.

export interface DocSSRProps {
  doc: DocDocument;
  /**
   * Custom id attribute for the SSR article. Use the same value in the client component to keep anchors aligned with the client version.
   */
  id?: string;
  /**
   * Extra class names applied to the wrapper element.
   */
  className?: string;
  /**
   * Extra class names applied to the summary column.
   */
  summaryClassName?: string;
  /**
   * Extra class names applied to the article column.
   */
  articleClassName?: string;
  /**
   * Extra class names applied to each section block.
   */
  sectionClassName?: string;
  /**
   * When true, the SSR output is visually hidden for sighted users while staying available to crawlers.
   */
  visuallyHidden?: boolean;
  /**
   * Toggle smooth scroll behavior for the enhanced client interactions.
   */
  smoothScroll?: boolean;
  /**
   * Tailwind class(es) used to position the sticky summary top offset.
   * Example: "top-4 lg:top-28". Defaults to "top-0 lg:top-24".
   */
  summaryTopClass?: string;
}

const levelToHeading = (level: number): keyof JSX.IntrinsicElements =>
  `h${level}` as keyof JSX.IntrinsicElements;

const numberToAlpha = (n: number) => {
  // 1 -> a, 2 -> b, ... 26 -> z, 27 -> aa
  let s = "";
  let num = n;
  while (num > 0) {
    num -= 1;
    s = String.fromCharCode(97 + (num % 26)) + s;
    num = Math.floor(num / 26);
  }
  return s;
};

const renderSection = (
  section: DocSection,
  sectionClassName: string | undefined,
  parentLevel?: number,
  prefix?: string
): JSX.Element => {
  const level = resolveSectionLevel(section, parentLevel);
  const Heading = levelToHeading(level);

  return (
    <section
      key={section.id}
      id={section.id}
      data-doc-section={section.id}
      className={`${
        sectionClassName ?? ""
      } scroll-mt-24 space-y-4 p-4 border border-stone-200 dark:border-stone-700 rounded-xl shadow-sm bg-white/90 dark:bg-stone-900/40 backdrop-blur doc-section`}
    >
      <Heading className="mt-0 text-3xl font-semibold text-slate-900 dark:text-slate-100 text-balance">
        {prefix ? `${prefix}. ` : ""}
        {section.title}
      </Heading>
      {section.content?.map((block, index) => {
        if (typeof block !== "string" && block.kind === "code") {
          const codeBlock = block as DocCodeBlock;
          const buttonId = `${section.id}-code-${index}`;
          return (
            <div key={index} className="relative">
              <pre className="  p-4 shadow-sm rounded-lg">
                <code
                  className={
                    codeBlock.language
                      ? `language-${codeBlock.language}`
                      : undefined
                  }
                >
                  {codeBlock.code}
                </code>
              </pre>
              <button
                type="button"
                data-doc-copy-button={buttonId}
                data-doc-copy-code={codeBlock.code}
                className="absolute top-2 right-2 text-white p-1 rounded-lg text-sm hover:scale-105 active:scale-95 transition-transform"
                aria-label="Copier le code"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-copy"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </button>
              <span
                data-doc-copy-tooltip={buttonId}
                role="status"
                className="absolute top-[-30px] right-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 translate-y-2 transition-all duration-200"
              >
                Copié !
              </span>
            </div>
          );
        }

        return renderBlock(block, index);
      })}
      {section.children?.map((child, childIndex) => {
        // If parent prefix exists and is top-level numeric (no dots), use alpha suffix: 1a, 1b
        const childPrefix = prefix
          ? prefix.includes(".")
            ? `${prefix}.${childIndex + 1}`
            : `${prefix}${numberToAlpha(childIndex + 1)}`
          : `${childIndex + 1}`;

        return renderSection(child, sectionClassName, level, childPrefix);
      })}
    </section>
  );
};

export function DocSSR({
  doc,
  id = DEFAULT_SSR_ID,
  className,
  summaryClassName,
  articleClassName,
  sectionClassName,
  visuallyHidden = false,
  smoothScroll = true,
  summaryTopClass = "top-0 lg:top-24",
}: DocSSRProps) {
  const sections = flattenSections(doc);
  const activeId = sections[0]?.id ?? null;

  // compute hierarchical prefixes for the flattened sections so the nav matches headings
  const prefixes: Record<string, string> = {};
  const counters: Record<number, number> = {};
  sections.forEach((section, idx) => {
    const lvl = section.level ?? 2;
    counters[lvl] = (counters[lvl] ?? 0) + 1;
    // reset deeper level counters
    Object.keys(counters).forEach((k) => {
      const kn = Number(k);
      if (kn > lvl) delete counters[kn];
    });

    let prefix = "";
    if (lvl === 2) {
      prefix = `${counters[2]}`;
    } else {
      // find closest ancestor with smaller level
      let ancestorPrefix = "";
      for (let j = idx - 1; j >= 0; j--) {
        const prev = sections[j];
        if ((prev.level ?? 2) < lvl) {
          ancestorPrefix = prefixes[prev.id];
          break;
        }
      }
      if (!ancestorPrefix) {
        prefix = `${counters[lvl]}`;
      } else {
        if (ancestorPrefix.includes(".")) {
          prefix = `${ancestorPrefix}.${counters[lvl]}`;
        } else {
          // immediate child of top-level -> alpha suffix
          prefix = `${ancestorPrefix}${numberToAlpha(counters[lvl])}`;
        }
      }
    }

    prefixes[section.id] = prefix;
  });

  const containerClassName = visuallyHidden
    ? `sr-only${className ? ` ${className}` : ""}`
    : `top-10 w-full flex flex-col gap-8 lg:flex-row lg:items-start${
        className ? ` ${className}` : ""
      }`;

  return (
    <>
      <div
        className={containerClassName}
        suppressHydrationWarning
        data-doc-root={id}
      >
        <div
          className={`flex-none z-10 sticky lg:h-[calc(100vh-8rem)] ${summaryTopClass} left-0 pt-2`}
        >
          <aside
            className={`w-full lg:w-auto sticky ${summaryTopClass} lg:overflow-y-auto border border-stone-300 dark:border-stone-700 bg-gray-50/60 dark:bg-black/70 rounded-xl p-4 backdrop-blur shadow-sm lg:max-w-[320px]${
              summaryClassName ? ` ${summaryClassName}` : ""
            }`}
          >
            <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-900 dark:text-stone-100">
                  Sommaire
                </p>
              </div>
              <button
                type="button"
                data-doc-summary-toggle={id}
                className="lg:hidden inline-flex items-center gap-2 rounded-md border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-black/70 px-3 py-1.5 text-sm font-medium text-stone-700 dark:text-stone-100 shadow-sm"
                aria-expanded="false"
                aria-controls={`${id}-summary`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-menu lucide-menu-icon"
                  aria-hidden
                >
                  <path d="M4 5h16" />
                  <path d="M4 12h16" />
                  <path d="M4 19h16" />
                </svg>
                Menu
              </button>
            </div>

            <nav
              aria-label="Sommaire"
              data-doc-summary={id}
              id={`${id}-summary`}
              className=" mt-4 text-sm space-y-2 hidden lg:block"
            >
              {sections.map((section, index) => {
                const indent = Math.max(0, (section.level - 2) * 12);
                const isActive = activeId === section.id;
                return (
                  <div
                    key={section.id}
                    className="flex flex-col gap-1"
                    style={{ paddingLeft: indent ? `${indent}px` : undefined }}
                  >
                    <a
                      href={`#${section.id}`}
                      data-doc-summary-link={section.id}
                      className={`text-md !no-underline relative pl-6 flex items-center gap-1 min-w-0 ${
                        isActive
                          ? " text-stone-900 dark:text-white"
                          : "text-stone-600 dark:text-stone-300"
                      } text-left transition hover:underline hover:text-black dark:hover:text-white`}
                    >
                      <span
                        data-doc-summary-marker
                        aria-hidden
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-center w-4 opacity-0 transition-opacity duration-200"
                      >
                        →
                      </span>
                      <span className="inline-block w-6 text-right">
                        {prefixes[section.id]}.
                      </span>
                      <span className="ml-2 truncate">{section.title}</span>
                    </a>
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>

        <article
          id={id}
          className={`pt-24 md:pt-0 py-5 flex-1 space-y-10 prose prose-stone max-w-none dark:prose-invert${
            articleClassName ? ` ${articleClassName}` : ""
          }`}
        >
          <header className="space-y-4 text-center pb-12">
            {doc.img ? (
              <img src={doc.img} alt="" className="mx-auto h-auto w-16" />
            ) : null}
            <h1 className="text-4xl font-bold tracking-tight text-stone-950 dark:text-stone-50 text-balance">
              {doc.title}
            </h1>
            {doc.description ? (
              <p className="text-lg text-stone-600 dark:text-stone-300">
                {doc.description}
              </p>
            ) : null}
          </header>

          {doc.sections.map((section, index) =>
            renderSection(section, sectionClassName, undefined, `${index + 1}`)
          )}
        </article>
      </div>
      {/* DocClient removed: keep DocSSR 100% server-side. Use ClientOnly + DocClient from the consumer app to mount the interactive version. */}
    </>
  );
}
