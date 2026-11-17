import type { ReactNode } from 'react';

import { TableOfContents } from '@/components/table-of-contents';
import type { TocHeading } from '@/lib/navigation';

export function DocsPage({ headings, children }: { headings: TocHeading[]; children: ReactNode }) {
  return (
    <>
      <main
        id='content'
        className='px-6 pb-10 pt-6 lg:px-8 xl:px-10'
      >
        <article className='prose max-w-content mx-auto'>{children}</article>
      </main>
      <aside
        aria-label='On this page'
        className='sticky top-16 hidden max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 pb-10 pt-6 text-sm xl:block'
      >
        {headings.length > 0 && <TableOfContents headings={headings} />}
      </aside>
    </>
  );
}
