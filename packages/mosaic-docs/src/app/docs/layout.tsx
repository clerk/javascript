import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/site-footer';
import { navigation } from '@/lib/navigation';
import { DocsNav } from '@/ui/docs-nav';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className='mx-auto grid w-full flex-1 grid-cols-1 items-start lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]'>
        <aside
          aria-label='Docs'
          className='scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent sticky top-16 hidden max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 pb-6 pt-4 lg:block'
        >
          <nav>
            <DocsNav groups={navigation} />
          </nav>
        </aside>
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
