'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { DEMOS } from '@/components/gallery/demos';
import { ScaledFrame } from '@/components/gallery/scaled-frame';
import { MosaicWordmark } from '@/components/marketing/mosaic-mark';
import { ThemeToggle } from '@/components/theme-toggle';
import { COMPONENT_META, getComponentMeta, GROUP_LABELS, GROUP_ORDER } from '@/lib/components/meta';
import { cn } from '@/lib/utils';
const SIDEBAR_WIDTH = 264;
const SIDEBAR_INSET = 12;
const PREVIEW_WIDTH = 340;
type NavLink = { href: string; label: string; slug?: string };
const groups: { label: string; href?: string; links: NavLink[] }[] = [
  {
    label: 'Getting started',
    links: [
      { href: '/', label: 'Overview' },
      { href: '/components', label: 'All components' },
      { href: '/tools/brand', label: 'Brand' },
    ],
  },
  ...GROUP_ORDER.map(group => ({
    label: GROUP_LABELS[group],
    links: COMPONENT_META.filter(item => item.group === group).map(item => ({
      href: `/components/${item.slug}`,
      label: item.title,
      slug: item.slug,
    })),
  })),
  {
    label: 'Lab',
    links: [{ href: '/tools', label: 'Brand tools' }],
  },
];
function SidebarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <rect
        x='3'
        y='4'
        width='18'
        height='16'
        rx='3'
      />
      <path d='M9 4v16' />
    </svg>
  );
}
function HoverPreview({ slug, top, left }: { slug: string; top: number; left: number }) {
  const meta = getComponentMeta(slug);
  const Demo = DEMOS[slug];
  if (!meta || !Demo) {
    return null;
  }
  return (
    <div
      aria-hidden='true'
      style={{
        top: Math.max(12, Math.min(top - 20, window.innerHeight - PREVIEW_WIDTH * 0.625 - 12)),
        left,
        width: PREVIEW_WIDTH,
      }}
      className='pointer-events-none fixed z-40 hidden lg:block'
    >
      <MosaicProvider>
        <ScaledFrame
          width={meta.thumbWidth}
          center={meta.center}
          className='ring-foreground/10 aspect-[16/10] rounded-2xl bg-[var(--cl-color-page,#fff)] shadow-2xl ring-1'
        >
          <Demo />
        </ScaledFrame>
      </MosaicProvider>
    </div>
  );
}
export function DocsShell({
  title,
  overlay = false,
  children,
}: {
  title: string;
  overlay?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(!overlay);
  const [ready, setReady] = React.useState(false);
  const inset = overlay ? SIDEBAR_INSET : 0;
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setReady(true);
      if (!overlay && window.innerWidth < 1024) {
        setOpen(false);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [overlay]);
  const [hover, setHover] = React.useState<{ slug: string; top: number } | null>(null);
  React.useEffect(() => {
    if (!overlay || !open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [overlay, open]);
  const showPreview = (link: NavLink, element: HTMLElement) => {
    if (link.slug) {
      setHover({ slug: link.slug, top: element.getBoundingClientRect().top });
    }
  };
  return (
    <div className='bg-background text-foreground min-h-svh'>
      <button
        type='button'
        tabIndex={-1}
        aria-hidden='true'
        onClick={() => setOpen(false)}
        className={cn('fixed inset-0 z-20 cursor-default', !(overlay && open) && 'pointer-events-none')}
      />
      <aside
        aria-label='Site'
        style={{ width: SIDEBAR_WIDTH, inset: `${inset}px auto ${inset}px ${inset}px` }}
        className={cn(
          'border-foreground/10 bg-background fixed z-30 flex flex-col gap-6 overflow-y-auto px-5 py-5 transition-[transform,opacity,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [scrollbar-width:none] motion-reduce:transition-none',
          overlay ? 'rounded-3xl border shadow-xl' : 'border-r',
          open && ready ? 'visible translate-x-0 opacity-100' : 'invisible -translate-x-[calc(100%+24px)] opacity-0',
        )}
      >
        <Link
          href='/'
          aria-label='Mosaic Components home'
          className='px-3'
        >
          <MosaicWordmark size={24} />
        </Link>
        <nav
          className='relative flex flex-col'
          onMouseLeave={() => setHover(null)}
        >
          {groups.map((group, groupIndex) => (
            <div
              key={group.label}
              className={cn('flex flex-col', groupIndex > 0 && 'mt-6')}
            >
              <div className='text-foreground flex h-9 items-center px-3 text-[15px] font-medium'>{group.label}</div>
              {group.links.map(link => {
                const active =
                  link.href === '/tools'
                    ? pathname.startsWith('/tools') && pathname !== '/tools/brand'
                    : pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    onMouseEnter={event => showPreview(link, event.currentTarget)}
                    onFocus={event => showPreview(link, event.currentTarget)}
                    onBlur={() => setHover(null)}
                    className={cn(
                      'flex h-9 items-center rounded-lg px-3 text-[15px] transition-colors',
                      active ? 'bg-foreground/[0.07] text-foreground' : 'hover:text-foreground text-neutral-500',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      {open && hover ? (
        <HoverPreview
          left={SIDEBAR_WIDTH + inset * 2}
          slug={hover.slug}
          top={hover.top}
        />
      ) : null}

      <div
        style={{ paddingLeft: open && !overlay ? SIDEBAR_WIDTH : 0 }}
        className='transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none max-lg:!pl-0'
      >
        <header className='border-foreground/10 bg-background/80 sticky top-0 z-20 flex h-14 items-center justify-between border-b px-4 backdrop-blur md:px-6'>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              aria-expanded={open}
              aria-label={open ? 'Hide sidebar' : 'Show sidebar'}
              onClick={() => setOpen(value => !value)}
              className='text-foreground hover:bg-foreground/[0.07] flex size-9 items-center justify-center rounded-lg transition-colors'
            >
              <SidebarIcon className='size-[18px]' />
            </button>
            <span className='text-sm text-neutral-500'>
              Mosaic <span aria-hidden='true'>/</span> <span className='text-foreground'>{title}</span>
            </span>
          </div>
          {overlay ? null : <ThemeToggle />}
        </header>
        {children}
      </div>
    </div>
  );
}
