import { cx } from 'cva';

import { Header } from './header';
import { Sidebar } from './sidebar';

export default function HomepageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className='z-1 pointer-events-none fixed inset-x-0 top-0 z-50 h-[calc(theme(size.1)-theme(ringWidth.1))] bg-neutral-100' />
      <div
        className={cx(
          'm-1 mb-0 grid h-[calc(100dvh-theme(size.1))] grid-cols-[min-content,minmax(0,1fr)] grid-rows-[min-content,minmax(0,1fr)] overflow-hidden rounded-t-xl bg-white ring-1 ring-neutral-900/[0.075]',
          'shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(32,42,54,0.04),0_24px_68px_rgba(47,48,56,0.15),0_2px_3px_rgba(0,0,0,0.09)]',
        )}
      >
        <Header />
        <Sidebar />
        <div className='relative'>{children}</div>
      </div>
    </>
  );
}
