import type { ReactNode } from 'react';

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

export function DocsAside({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label='On this page'
      className='scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent *:not-first:border-border *:not-first:mt-6 *:not-first:border-t *:not-first:pt-6 sticky top-16 hidden max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 pb-10 pt-6 text-sm xl:block'
    >
      {children}
    </aside>
  );
}
