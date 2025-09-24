"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DocCodeBlock, DocDocument } from "./types";
import {
  DEFAULT_SSR_ID,
  flattenSections,
  renderBlock,
  resolveSectionLevel,
} from "./utils";

export interface DocClientProps {
  doc: DocDocument;
  /**
   * Identifier of the SSR element to hide once the client bundle is ready.
   */
  img?: string;
  /**
   * Identifier of the SSR element to hide once the client bundle is ready.
   */
  ssrId?: string;
  /**
   * Class names applied to the root container.
   */
  className?: string;
  /**
   * Class names applied to the summary column.
   */
  summaryClassName?: string;
  /**
   * Class names applied to the article column.
   */
  articleClassName?: string;
  /**
   * Toggle smooth scroll behavior.
   */
  smoothScroll?: boolean;
}

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function DocClient({
  doc,
  ssrId = DEFAULT_SSR_ID,
  className,
  summaryClassName,
  articleClassName,
  smoothScroll = true,
}: DocClientProps) {
  const sections = useMemo(() => flattenSections(doc), [doc]);
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null
  );
  const [summaryOpen, setSummaryOpen] = useState<boolean>(false);
  const [tooltipVisibleId, setTooltipVisibleId] = useState<string | null>(null);

  useEffect(() => {
    const element = document.getElementById(ssrId);
    if (!element) return;
    const previousHidden = element.getAttribute("hidden");
    const previousAria = element.getAttribute("aria-hidden");
    const descendantsWithId = Array.from(
      element.querySelectorAll<HTMLElement>("[id]")
    ).map((node) => ({
      node,
      original: node.getAttribute("id"),
    }));

    element.setAttribute("hidden", "true");
    element.setAttribute("aria-hidden", "true");
    descendantsWithId.forEach(({ node, original }) => {
      if (original) {
        node.setAttribute("data-doc-ssr-id", original);
        node.removeAttribute("id");
      }
    });

    return () => {
      if (previousHidden === null) {
        element.removeAttribute("hidden");
      } else {
        element.setAttribute("hidden", previousHidden);
      }

      if (previousAria === null) {
        element.removeAttribute("aria-hidden");
      } else {
        element.setAttribute("aria-hidden", previousAria);
      }

      descendantsWithId.forEach(({ node, original }) => {
        if (!node.isConnected) return;
        if (original) {
          node.setAttribute("id", original);
        }
        node.removeAttribute("data-doc-ssr-id");
      });
    };
  }, [ssrId]);

  useEffect(() => {
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0.2,
      }
    );

    const observed: Element[] = [];
    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) {
        observer.observe(el);
        observed.push(el);
      }
    });

    return () => {
      observed.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [sections]);

  const handleNavigate = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;
      if (smoothScroll) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        element.scrollIntoView();
      }
      setSummaryOpen(false);
      setActiveId(id);
    },
    [smoothScroll]
  );

  const handleCopyToClipboard = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setTooltipVisibleId(id);
    setTimeout(() => setTooltipVisibleId(null), 2000);
  }, []);

  const renderClientSections = useCallback(() => {
    const renderSection = (
      section: DocDocument["sections"][number],
      parentLevel?: number
    ): JSX.Element => {
      const level = resolveSectionLevel(section, parentLevel);
      const Heading = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <motion.section
          key={section.id}
          id={section.id}
          className="scroll-mt-24 space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          transition={{ duration: 0.4 }}
        >
          <Heading className="font-semibold text-slate-900 dark:text-slate-100 text-balance">
            {section.title}
          </Heading>
          {section.content?.map((block, index) => {
            if (typeof block !== "string" && block.kind === "code") {
              const codeBlock = block as DocCodeBlock;
              const buttonId = `${section.id}-code-${index}`;
              return (
                <div key={index} className="relative ">
                  <pre className="bg-white dark:bg-black/30 border border-stone-200 dark:border-stone-950 text-gray-950 dark:text-gray-50 p-4 shadow-sm rounded-lg">
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
                    id={buttonId}
                    onClick={() =>
                      handleCopyToClipboard(codeBlock.code, buttonId)
                    }
                    className="active:scale-95 hover:scale-105 transition-all absolute top-2 right-2 text-black dark:text-white bg-white dark:bg-black/30  p-1 rounded-lg text-sm hover:bg-white dark:hover:bg-black/60"
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
                      className="lucide lucide-copy-icon lucide-copy"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </button>
                  {tooltipVisibleId === buttonId && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-[-30px] right-2 bg-black text-white text-xs px-2 py-1 rounded"
                    >
                      Copié !
                    </motion.div>
                  )}
                </div>
              );
            }
            return renderBlock(block, index);
          })}
          {section.children?.map((child) => renderSection(child, level))}
        </motion.section>
      );
    };

    return doc.sections.map((section) => renderSection(section));
  }, [doc, handleCopyToClipboard, tooltipVisibleId]);

  return (
    <motion.section
      key={doc.title}
      id={doc.title}
      className="scroll-mt-12 space-y-4 w-full"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeIn}
      transition={{ duration: 0.4 }}
    >
      <div
        className={`top-10 w-full flex flex-col gap-8 lg:flex-row ${
          className ?? ""
        }`}
      >
        <div className="z-10 w-full md:w-1/4 sticky md:h-[calc(100vh-8rem)] top-0 md:top-24 left-0 pt-2">
          <aside
            className={`w-full sticky top-24 lg:overflow-y-auto border border-stone-300 dark:border-stone-700 black/10 bg-gray-50/60 ${
              summaryOpen ? `dark:bg-black/60` : `dark:bg-black/10`
            }  rounded-xl p-4  backdrop-blur shadow-sm ${
              summaryClassName ?? ""
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
                className="lg:hidden inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white dark:bg-black/70 px-3 py-1.5 text-sm font-medium text-stone-700 dark:text-stone-100 shadow-sm transition hover:bg-stone-50"
                onClick={() => setSummaryOpen((value) => !value)}
                aria-expanded={summaryOpen}
              >
                {summaryOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-x-icon lucide-x"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    width="24"
                    height="24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
                {summaryOpen ? "Fermer" : "Menu"}
              </button>
            </div>

            <motion.nav
              aria-label="Sommaire"
              className={`ps-5 mt-4  text-sm ${
                summaryOpen ? "block space-y-4 " : "space-y-2  hidden lg:block "
              }`}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.3 }}
            >
              {sections.map((section) => {
                const indent = Math.max(0, (section.level - 2) * 12);
                return (
                  <div
                    key={section.id}
                    className="flex flex-col gap-1 md:hover:scale-105 active:scale-95 transition-all"
                    style={{ paddingLeft: indent ? `${indent}px` : undefined }}
                  >
                    <button
                      type="button"
                      onClick={() => handleNavigate(section.id)}
                      className={`${
                        summaryOpen ? `text-lg` : `text-sm`
                      } text-left transition  hover:text-black dark:hover:text-white ${
                        activeId === section.id
                          ? "text-stone-700 dark:text-gray-100 font-bold text-lg"
                          : "text-stone-600 dark:text-stone-300 "
                      }`}
                    >
                      {activeId === section.id && "•"} {section.title}
                    </button>
                  </div>
                );
              })}
            </motion.nav>
          </aside>
        </div>

        <motion.article
          className={`pt-24 md:pt-0  flex-1 lg:w-3/4 space-y-10 prose prose-stone max-w-none dark:prose-invert ${
            articleClassName ?? ""
          }`}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.4 }}
        >
          <header className="space-y-4 text-center pb-24 ">
            <img src={doc?.img} alt="" className="mx-auto h-auto w-16" />
            <h1 className="text-4xl font-bold tracking-tight text-stone-950 dark:text-stone-50 text-balance">
              {doc.title}
            </h1>
            {doc.description ? (
              <p className="text-lg text-stone-600 dark:text-stone-300">
                {doc.description}
              </p>
            ) : null}
          </header>
          {renderClientSections()}
        </motion.article>
      </div>
    </motion.section>
  );
}

export default DocClient;
