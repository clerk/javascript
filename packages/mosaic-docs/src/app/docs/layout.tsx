import type { ReactNode } from 'react';

import { DocsSidebar } from '@/components/docs-sidebar';
import { navigation } from '@/lib/navigation';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className='mx-auto grid max-w-screen-2xl gap-10 px-4 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)]'>
      <aside className='hidden lg:block'>
        <div className='sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8'>
          <DocsSidebar groups={navigation} />
        </div>
      </aside>
      <main className='mx-auto w-full max-w-2xl py-10'>{children}</main>
    </div>
  );
}
