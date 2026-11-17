'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { DocsNav, type NavGroup, type NavItem } from './docs-nav';

export function MobileNav({ tabs, groups }: { tabs: NavItem[]; groups: NavGroup[] }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) {
      return;
    }
    const desktop = matchMedia('(min-width: 64rem)');
    const closeOnDesktop = () => desktop.matches && element.close();
    const closeOnClick = (event: MouseEvent) => {
      if (event.target === element || (event.target instanceof Element && event.target.closest('a'))) {
        element.close();
      }
    };
    desktop.addEventListener('change', closeOnDesktop);
    element.addEventListener('click', closeOnClick);
    return () => {
      desktop.removeEventListener('change', closeOnDesktop);
      element.removeEventListener('click', closeOnClick);
    };
  }, []);

  return (
    <>
      <button
        type='button'
        aria-label='Open navigation'
        onClick={() => dialog.current?.showModal()}
        className='text-muted-foreground hover:bg-muted hover:text-foreground -ml-1.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors lg:hidden'
      >
        <svg
          aria-hidden
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
          className='size-[18px]'
        >
          <path d='M4 6h16M4 12h16M4 18h16' />
        </svg>
      </button>
      <dialog
        ref={dialog}
        aria-label='Navigation'
        className='drawer bg-background text-foreground border-border m-0 h-dvh max-h-none w-72 max-w-[80vw] border-e p-0'
      >
        <div className='scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent h-full overflow-y-auto px-5 pb-6 pt-3'>
          <div className='mb-4 flex items-center justify-end'>
            <button
              type='button'
              aria-label='Close navigation'
              onClick={() => dialog.current?.close()}
              className='text-muted-foreground hover:bg-muted hover:text-foreground -mr-1.5 inline-flex size-9 items-center justify-center rounded-md transition-colors'
            >
              <svg
                aria-hidden
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                className='size-[18px]'
              >
                <path d='M18 6 6 18M6 6l12 12' />
              </svg>
            </button>
          </div>
          <nav
            aria-label='Sections'
            className='border-border mb-6 border-b pb-4'
          >
            <ul className='m-0 list-none space-y-px p-0'>
              {tabs.map(tab => (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    className='nav-link font-medium'
                  >
                    {tab.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label='Docs'>
            <DocsNav groups={groups} />
          </nav>
        </div>
      </dialog>
    </>
  );
}
