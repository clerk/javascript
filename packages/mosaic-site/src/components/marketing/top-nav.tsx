'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { OptionPicker, ThemeIcon } from '@/components/gallery/option-picker';
import { ThemeStyles } from '@/components/gallery/theme';
import { ClerkUILogo } from '@/components/marketing/clerk-logo';
import { ModeSwitch } from '@/components/theme-toggle';
import { useMosaicTheme } from '@/components/use-mosaic-theme';
import { type ThemeId, THEMES } from '@/lib/components/theme';
import { cn } from '@/lib/utils';
const linkClass = 'flex h-8 items-center rounded-md px-3 text-sm transition-colors';
export function TopNav() {
  const pathname = usePathname();
  const [theme, setTheme] = useMosaicTheme();
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'default') {
      delete root.dataset.mosaicTheme;
    } else {
      root.dataset.mosaicTheme = theme;
    }
  }, [theme, pathname]);
  const docs = pathname !== '/';
  return (
    <>
      <ThemeStyles />
      <header className='border-foreground/10 bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-6 border-b px-4 backdrop-blur md:px-6'>
        <Link
          href='/'
          aria-label='Clerk UI home'
          className='text-foreground flex shrink-0 items-center'
        >
          <ClerkUILogo className='h-4' />
        </Link>
        <nav
          aria-label='Primary'
          className='flex items-center gap-1'
        >
          <Link
            href='/installation'
            aria-current={docs ? 'page' : undefined}
            className={cn(linkClass, docs ? 'text-foreground font-medium' : 'hover:text-foreground text-neutral-500')}
          >
            Docs
          </Link>
          <span
            aria-disabled='true'
            className={cn(linkClass, 'cursor-default gap-2 text-neutral-500 max-sm:hidden')}
          >
            Showcase
            <span className='bg-foreground/[0.06] rounded-full px-2 py-0.5 text-[11px] font-medium text-neutral-500'>
              Coming soon
            </span>
          </span>
          <span
            aria-disabled='true'
            className={cn(linkClass, 'cursor-default text-neutral-500 max-sm:hidden')}
          >
            Changelog
          </span>
        </nav>
        <div className='ml-auto flex items-center gap-3'>
          <button
            type='button'
            className='border-foreground/10 bg-foreground/[0.04] hover:bg-foreground/[0.07] flex h-9 w-64 items-center gap-2 rounded-lg border px-3 text-sm text-neutral-500 transition-colors max-md:hidden'
          >
            <svg
              viewBox='0 0 16 16'
              className='size-4 shrink-0'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <circle
                cx='7'
                cy='7'
                r='4.5'
              />
              <path d='m10.5 10.5 3 3' />
            </svg>
            <span className='flex-1 text-left'>Search components…</span>
            <kbd className='bg-foreground/[0.06] rounded px-1.5 py-0.5 font-sans text-[11px]'>⌘K</kbd>
          </button>
          <OptionPicker
            label='Theme'
            slug='user-button'
            placement='below'
            options={THEMES}
            value={theme}
            onChange={value => setTheme(value as ThemeId)}
            previewQuery={id => `theme=${id}&remix=default`}
            icon={() => <ThemeIcon />}
            pillClass='border-foreground/10 bg-foreground/[0.04] hover:bg-foreground/[0.07] flex items-center rounded-lg border transition-colors'
            header={<ModeSwitch />}
          />
        </div>
      </header>
    </>
  );
}
