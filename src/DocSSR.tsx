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
}

const levelToHeading = (level: number): keyof JSX.IntrinsicElements =>
  `h${level}` as keyof JSX.IntrinsicElements;

const renderSection = (
  section: DocSection,
  sectionClassName: string | undefined,
  parentLevel?: number
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
      {section.children?.map((child) =>
        renderSection(child, sectionClassName, level)
      )}
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
}: DocSSRProps) {
  const sections = flattenSections(doc);
  const activeId = sections[0]?.id ?? null;

  const containerClassName = visuallyHidden
    ? `sr-only${className ? ` ${className}` : ""}`
    : `top-10 w-full flex flex-col gap-8 lg:flex-row${
        className ? ` ${className}` : ""
      }`;

  return (
    <>
      <div
        className={containerClassName}
        suppressHydrationWarning
        data-doc-root={id}
      >
        <div className="z-10 sticky md:h-[calc(100vh-8rem)] top-0 md:top-24 left-0 pt-2">
          <aside
            className={`w-full sticky top-24 lg:overflow-y-auto border border-stone-300 dark:border-stone-700 bg-gray-50/60 dark:bg-black/70 rounded-xl p-4 backdrop-blur shadow-sm${
              summaryClassName ? ` ${summaryClassName}` : ""
            }`}
          >
            <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-900 dark:text-stone-100">
                  Sommaire
                </p>
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {doc.title}
                </h2>
              </div>
              <button
                type="button"
                data-doc-summary-toggle={id}
                className="md:hidden inline-flex items-center gap-2 rounded-md border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-black/70 px-3 py-1.5 text-sm font-medium text-stone-700 dark:text-stone-100 shadow-sm"
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
              className="ps-5 mt-4 text-sm space-y-2 hidden md:block"
            >
              {sections.map((section) => {
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
                      className={`text-md ${
                        isActive
                          ? "font-bold text-white dark:text-white"
                          : "text-stone-600 dark:text-stone-300"
                      } text-left transition hover:text-black dark:hover:text-white`}
                    >
                      {isActive ? "• " : ""}
                      {section.title}
                    </a>
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>

        <article
          id={id}
          className={`pt-24 md:pt-0 py-5 flex-1 lg:w-3/4 space-y-10 prose prose-stone max-w-none dark:prose-invert${
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

          {doc.sections.map((section) =>
            renderSection(section, sectionClassName)
          )}
        </article>
      </div>
      {/* DocClient removed: keep DocSSR 100% server-side. Use ClientOnly + DocClient from the consumer app to mount the interactive version. */}
    </>
  );
}
