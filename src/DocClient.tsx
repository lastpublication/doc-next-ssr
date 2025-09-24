'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DocDocument } from './types';
import { DEFAULT_SSR_ID, flattenSections, renderBlock, resolveSectionLevel } from './utils';

export interface DocClientProps {
  doc: DocDocument;
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
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const [summaryOpen, setSummaryOpen] = useState<boolean>(false);

  useEffect(() => {
    const element = document.getElementById(ssrId);
    if (!element) return;
    const previousHidden = element.getAttribute('hidden');
    const previousAria = element.getAttribute('aria-hidden');
    const descendantsWithId = Array.from(
      element.querySelectorAll<HTMLElement>('[id]')
    ).map((node) => ({
      node,
      original: node.getAttribute('id'),
    }));

    element.setAttribute('hidden', 'true');
    element.setAttribute('aria-hidden', 'true');
    descendantsWithId.forEach(({ node, original }) => {
      if (original) {
        node.setAttribute('data-doc-ssr-id', original);
        node.removeAttribute('id');
      }
    });

    return () => {
      if (previousHidden === null) {
        element.removeAttribute('hidden');
      } else {
        element.setAttribute('hidden', previousHidden);
      }

      if (previousAria === null) {
        element.removeAttribute('aria-hidden');
      } else {
        element.setAttribute('aria-hidden', previousAria);
      }

      descendantsWithId.forEach(({ node, original }) => {
        if (!node.isConnected) return;
        if (original) {
          node.setAttribute('id', original);
        }
        node.removeAttribute('data-doc-ssr-id');
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
        rootMargin: '-40% 0px -40% 0px',
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
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        element.scrollIntoView();
      }
      setSummaryOpen(false);
      setActiveId(id);
    },
    [smoothScroll]
  );

  const renderClientSections = useCallback(() => {
    const renderSection = (
      section: DocDocument['sections'][number],
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
          {section.content?.map((block, index) => renderBlock(block, index))}
          {section.children?.map((child) => renderSection(child, level))}
        </motion.section>
      );
    };

    return doc.sections.map((section) => renderSection(section));
  }, [doc]);

  return (
    <div className={`flex flex-col gap-8 lg:flex-row ${className ?? ''}`}>
      <aside
        className={`lg:w-1/4 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm ${
          summaryClassName ?? ''
        }`}
      >
        <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Sommaire</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{doc.title}</h2>
          </div>
          <button
            type="button"
            className="lg:hidden inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={() => setSummaryOpen((value) => !value)}
            aria-expanded={summaryOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {summaryOpen ? 'Fermer' : 'Menu'}
          </button>
        </div>

        <motion.nav
          aria-label="Sommaire"
          className={`mt-4 space-y-2 text-sm ${summaryOpen ? 'block' : 'hidden lg:block'}`}
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
                className="flex flex-col gap-1"
                style={{ paddingLeft: indent ? `${indent}px` : undefined }}
              >
                <button
                  type="button"
                  onClick={() => handleNavigate(section.id)}
                className={`text-left transition hover:text-sky-600 ${
                  activeId === section.id
                    ? 'text-sky-600 font-semibold'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
                >
                  {section.title}
                </button>
              </div>
            );
          })}
        </motion.nav>
      </aside>

      <motion.article
        className={`lg:w-3/4 space-y-10 prose prose-slate max-w-none dark:prose-invert ${articleClassName ?? ''}`}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.4 }}
      >
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50 text-balance">
            {doc.title}
          </h1>
          {doc.description ? (
            <p className="text-lg text-slate-600 dark:text-slate-300">{doc.description}</p>
          ) : null}
        </header>
        {renderClientSections()}
      </motion.article>
    </div>
  );
}
