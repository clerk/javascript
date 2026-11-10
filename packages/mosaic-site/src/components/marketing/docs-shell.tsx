'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { DEMOS } from '@/components/gallery/demos';
import { ScaledFrame } from '@/components/gallery/scaled-frame';
import { GLASS_EDGES, GLASS_SCHEME, glassStyle } from '@/components/glass';
import { ClerkComponentsLogo } from '@/components/marketing/clerk-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { getComponentMeta } from '@/lib/components/meta';
import { NAV_SECTIONS } from '@/lib/components/nav';
import { ROADMAP } from '@/lib/components/roadmap';
import { cn } from '@/lib/utils';
const SIDEBAR_WIDTH = 232;
const PREVIEW_WIDTH = 340;
type NavLink = { href: string; label: string; slug?: string; comingSoon?: boolean };
const gettingStarted: NavLink[] = [
  { href: '/', label: 'Overview' },
  { href: '/installation', label: 'Installation' },
  { href: '/colors', label: 'Colors' },
];
const sections = NAV_SECTIONS.map(section => ({
  label: section.label,
  groups: section.groups.map(group => ({
    label: group.label,
    links: group.slugs
      .map(slug => ROADMAP.find(item => item.slug === slug))
      .filter(item => item !== undefined)
      .map(item => ({
        href: `/components/${item.slug}`,
        label: item.title,
        slug: item.slug,
        comingSoon: item.status === 'soon',
      }))
      .sort((a, b) => Number(a.comingSoon) - Number(b.comingSoon)),
  })),
}));
function NavItem({
  link,
  pathname,
  showPreview,
  setHover,
}: {
  link: NavLink;
  pathname: string;
  showPreview: (link: NavLink, element: HTMLElement) => void;
  setHover: (value: null) => void;
}) {
  if (link.comingSoon) {
    return (
      <span
        aria-disabled='true'
        onMouseEnter={event => showPreview(link, event.currentTarget)}
        className='flex h-7 cursor-not-allowed items-center rounded-md px-2.5 text-[13px] text-neutral-400 dark:text-neutral-600'
      >
        <span className='truncate'>{link.label}</span>
      </span>
    );
  }
  const active = pathname === link.href;
  return (
    <Link
      href={link.href}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={event => showPreview(link, event.currentTarget)}
      onFocus={event => showPreview(link, event.currentTarget)}
      onBlur={() => setHover(null)}
      className={cn(
        'flex h-7 items-center rounded-md px-2.5 text-[13px] transition-colors',
        active ? 'bg-foreground/[0.07] text-foreground' : 'hover:text-foreground text-neutral-500',
      )}
    >
      {link.label}
    </Link>
  );
}
function NavSectionGroup({
  section,
  pathname,
  showPreview,
  setHover,
}: {
  section: (typeof sections)[number];
  pathname: string;
  showPreview: (link: NavLink, element: HTMLElement) => void;
  setHover: (value: null) => void;
}) {
  const containsActive = section.groups.some(group => group.links.some(link => link.href === pathname));
  const [expanded, setExpanded] = React.useState(containsActive || section.label === 'Authentication');
  const panelId = React.useId();
  const comingSoon = section.groups.every(group => group.links.every(link => link.comingSoon));
  return (
    <div className='mt-3 flex flex-col'>
      <button
        type='button'
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded(value => !value)}
        className='text-foreground hover:bg-foreground/[0.04] flex h-8 items-center justify-between rounded-md px-2.5 text-[13px] font-medium transition-colors'
      >
        <span className='flex items-center gap-2'>
          {section.label}
          {comingSoon ? (
            <span className='bg-foreground/[0.06] rounded-full px-2 py-0.5 text-[11px] font-medium text-neutral-500'>
              Coming soon
            </span>
          ) : null}
        </span>
        <svg
          viewBox='0 0 16 16'
          className={cn(
            'size-4 text-neutral-400 transition-transform duration-300 motion-reduce:transition-none',
            expanded && 'rotate-180',
          )}
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <path d='m4 6 4 4 4-4' />
        </svg>
      </button>
      <div
        id={panelId}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        {...(expanded ? {} : { inert: true })}
      >
        <div className='overflow-hidden'>
          {section.groups.map(group => (
            <div
              key={group.label}
              className='mt-2 flex flex-col first:mt-1'
            >
              <div className='flex h-6 items-center px-2.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500'>
                {group.label}
              </div>
              {group.links.map(link => (
                <NavItem
                  key={link.href}
                  link={link}
                  pathname={pathname}
                  showPreview={showPreview}
                  setHover={setHover}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
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
function HoverPreview({
  slug,
  top,
  left,
  comingSoon,
}: {
  slug: string;
  top: number;
  left: number;
  comingSoon?: boolean;
}) {
  const meta = getComponentMeta(slug);
  const Demo = DEMOS[slug];
  const position = {
    top: Math.max(12, Math.min(top - 20, window.innerHeight - PREVIEW_WIDTH * 0.625 - 12)),
    left,
    width: PREVIEW_WIDTH,
  };
  if (comingSoon) {
    return (
      <div
        aria-hidden='true'
        style={position}
        className='pointer-events-none fixed z-40 hidden lg:block'
      >
        <div className='ring-foreground/10 bg-background flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-2xl shadow-2xl ring-1'>
          <span className='bg-foreground/[0.06] ring-foreground/10 flex size-11 items-center justify-center rounded-full ring-1'>
            <svg
              viewBox='0 0 24 24'
              className='size-5'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.75'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <rect
                x='5'
                y='11'
                width='14'
                height='9'
                rx='2'
              />
              <path d='M8 11V8a4 4 0 0 1 8 0v3' />
            </svg>
          </span>
          <span className='bg-foreground/[0.06] rounded-full px-2.5 py-1 text-[12px] font-medium text-neutral-500'>
            Coming soon
          </span>
        </div>
      </div>
    );
  }
  if (!meta || !Demo) {
    return null;
  }
  return (
    <div
      aria-hidden='true'
      style={position}
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
export function DocsShell({ children }: { title?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMobileOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  const [hover, setHover] = React.useState<{ slug: string; top: number; comingSoon?: boolean } | null>(null);
  const showPreview = (link: NavLink, element: HTMLElement) => {
    if (link.slug) {
      setHover({ slug: link.slug, top: element.getBoundingClientRect().top, comingSoon: link.comingSoon });
    }
  };
  return (
    <div className='bg-background text-foreground min-h-svh'>
      <button
        type='button'
        tabIndex={-1}
        aria-hidden='true'
        onClick={() => setMobileOpen(false)}
        className={cn('fixed inset-0 z-20 cursor-default lg:hidden', !mobileOpen && 'pointer-events-none')}
      />
      <aside
        aria-label='Site'
        style={
          {
            width: SIDEBAR_WIDTH,
            '--glass-r': '1.5rem',
            ...glassStyle({ light: 'white', dark: 'gray-850' }),
          } as React.CSSProperties
        }
        className={cn(
          GLASS_SCHEME,
          GLASS_EDGES,
          'fixed bottom-3 left-3 top-3 isolate z-30 flex-col rounded-3xl transition-[opacity,translate] duration-700 lg:flex',
          mobileOpen ? 'flex' : 'hidden',
        )}
      >
        <div className='bg-(--glass-fill) absolute inset-0 -z-20 rounded-[inherit] backdrop-blur-md [box-shadow:var(--glass-shadow)]' />
        <div className='flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 pt-4 [scrollbar-width:none]'>
          <Link
            href='/'
            aria-label='Clerk components home'
            className='px-2.5'
          >
            <ClerkComponentsLogo className='h-4' />
          </Link>
          <nav
            className='relative flex flex-col'
            onMouseLeave={() => setHover(null)}
          >
            <div className='flex flex-col'>
              <div className='text-foreground flex h-7 items-center px-2.5 text-[13px] font-medium'>
                Getting started
              </div>
              {gettingStarted.map(link => (
                <NavItem
                  key={link.href}
                  link={link}
                  pathname={pathname}
                  showPreview={showPreview}
                  setHover={setHover}
                />
              ))}
            </div>
            {sections.map(section => (
              <NavSectionGroup
                key={section.label}
                section={section}
                pathname={pathname}
                showPreview={showPreview}
                setHover={setHover}
              />
            ))}
          </nav>
        </div>
        <div className='flex shrink-0 items-center px-3 py-3 max-lg:hidden'>
          <ThemeToggle />
        </div>
      </aside>
      {hover ? (
        <HoverPreview
          left={SIDEBAR_WIDTH + 24}
          slug={hover.slug}
          top={hover.top}
          comingSoon={hover.comingSoon}
        />
      ) : null}
      <div className='fixed bottom-4 left-4 z-40 flex items-center gap-2 lg:hidden'>
        <ThemeToggle className='lg:hidden' />
        <button
          type='button'
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Hide sidebar' : 'Show sidebar'}
          onClick={() => setMobileOpen(value => !value)}
          className='border-foreground/15 text-foreground bg-background hover:border-foreground/40 flex size-9 items-center justify-center rounded-full border transition-colors lg:hidden'
        >
          <SidebarIcon className='size-[18px]' />
        </button>
      </div>
      <div className='lg:pl-64'>{children}</div>
    </div>
  );
}
