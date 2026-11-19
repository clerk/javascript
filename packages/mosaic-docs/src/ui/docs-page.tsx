import type { ReactNode } from 'react';

import type { TocHeading } from '@/core/toc';

import { CopyPageButton } from './copy-page-button';
import { PageOutline } from './page-outline';
import { TableOfContents } from './table-of-contents';

export function DocsPage({
  headings,
  markdownHref,
  children,
}: {
  headings: TocHeading[];
  markdownHref: string;
  children: ReactNode;
}) {
  return (
    <>
      <DocsArticle>
        <PageOutline headings={headings}>
          <CopyPageButton href={markdownHref} />
        </PageOutline>
        {children}
      </DocsArticle>
      <aside
        aria-label='On this page'
        className='scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent *:not-first:border-border *:not-first:mt-6 *:not-first:border-t *:not-first:pt-6 sticky top-16 hidden max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 pb-10 pt-6 text-sm xl:block'
      >
        <TableOfContents headings={headings} />
        <CopyPageButton href={markdownHref} />
      </aside>
    </>
  );
}

export function DocsArticle({ children }: { children: ReactNode }) {
  return (
    <main
      id='content'
      className='px-6 pb-10 pt-6 lg:px-8 xl:px-10'
    >
      <article className='prose max-w-content mx-auto'>{children}</article>
    </main>
  );
}
