import type { FC } from 'react';
import type { DocDocument, DocSection } from './types';
import { DEFAULT_SSR_ID, renderBlock, resolveSectionLevel } from './utils';

export interface DocSSRProps {
  doc: DocDocument;
  /**
   * Custom id attribute for the SSR article. Use the same value in the client component to hide it when JS loads.
   */
  id?: string;
  /**
   * Extra class names applied to the wrapper element.
   */
  className?: string;
  /**
   * When true, the SSR output is visually hidden for sighted users while staying available to crawlers.
   */
  visuallyHidden?: boolean;
}

const levelToHeading = (level: number): keyof JSX.IntrinsicElements => `h${level}` as keyof JSX.IntrinsicElements;

const Section: FC<{ section: DocSection; parentLevel?: number }> = ({
  section,
  parentLevel,
}) => {
  const level = resolveSectionLevel(section, parentLevel);
  const Heading = levelToHeading(level);

  return (
    <section id={section.id} className="scroll-mt-24 space-y-4">
      <Heading className="font-semibold text-slate-900 dark:text-slate-100 text-balance">
        {section.title}
      </Heading>
      {section.content?.map((block, index) => renderBlock(block, index))}
      {section.children?.map((child) => (
        <Section key={child.id} section={child} parentLevel={level} />
      ))}
    </section>
  );
};

export function DocSSR({ doc, id = DEFAULT_SSR_ID, visuallyHidden = false, className }: DocSSRProps) {
  const hiddenClass = visuallyHidden
    ? 'sr-only'
    : 'prose prose-slate max-w-none dark:prose-invert space-y-8';

  return (
    <article
      id={id}
      className={`${hiddenClass}${className ? ` ${className}` : ''}`}
      suppressHydrationWarning
    >
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50 text-balance">
          {doc.title}
        </h1>
        {doc.description ? <p className="text-lg text-slate-600 dark:text-slate-300">{doc.description}</p> : null}
        {doc.sections.length ? (
          <nav aria-label="Sommaire" className="space-y-2">
            <p className="uppercase tracking-wide text-xs font-medium text-slate-500">Sommaire</p>
            <ul className="space-y-1">
              {doc.sections.map((section) => (
                <li key={section.id}>
                  <a className="text-sky-600 hover:underline" href={`#${section.id}`}>
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      {doc.sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
    </article>
  );
}
