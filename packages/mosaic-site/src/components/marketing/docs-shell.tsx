'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { DEMOS } from '@/components/gallery/demos';
import { ScaledFrame } from '@/components/gallery/scaled-frame';
import { TopNav } from '@/components/marketing/top-nav';
import { CATALOG, type CatalogItem, type Kind } from '@/lib/components/catalog';
import { getComponentMeta } from '@/lib/components/meta';
import { cn } from '@/lib/utils';
const SIDEBAR_WIDTH = 256;
const PREVIEW_WIDTH = 340;
const PREVIEW_DELAY = 500;
const PREVIEW_GRACE = 250;
type NavLink = { href: string; label: string; slug?: string; comingSoon?: boolean; hideBadge?: boolean };
const gettingStarted: NavLink[] = [
  { href: '/installation', label: 'Installation' },
  { href: '/colors', label: 'Colors' },
];
const itemHref = (kind: Kind, slug: string) => `/${kind}/${slug}`;
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
        onMouseLeave={() => setHover(null)}
        className='flex h-8 cursor-not-allowed items-center gap-2 rounded-md px-2.5 text-sm text-neutral-400 dark:text-neutral-600'
      >
        <span className='truncate'>{link.label}</span>
        {link.hideBadge ? null : <SoonBadge />}
      </span>
    );
  }
  const active = pathname === link.href;
  return (
    <Link
      href={link.href}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={event => showPreview(link, event.currentTarget)}
      onMouseLeave={() => setHover(null)}
      onFocus={event => showPreview(link, event.currentTarget)}
      onBlur={() => setHover(null)}
      className={cn(
        'focus-visible:ring-foreground/60 flex h-8 items-center rounded-md px-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset',
        active ? 'bg-foreground/[0.06] text-foreground font-medium' : 'hover:text-foreground text-neutral-500',
      )}
    >
      {link.label}
    </Link>
  );
}
function SoonBadge() {
  return (
    <span className='bg-foreground/[0.06] ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-neutral-500'>
      Soon
    </span>
  );
}
const HEADER_CLASS =
  'flex h-8 items-center gap-2 px-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500';
function CountBadge({ count }: { count: number }) {
  return (
    <span className='bg-foreground/[0.06] rounded-full px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal text-neutral-500'>
      {count}
    </span>
  );
}
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox='0 0 16 16'
      className={cn(
        'size-4 text-neutral-400 transition-transform duration-300 motion-reduce:transition-none',
        !open && '-rotate-90',
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
  );
}
function Collapsible({ open, id, children }: { open: boolean; id: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      className={cn(
        'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
      {...(open ? {} : { inert: true })}
    >
      <div className='overflow-hidden'>
        <div className='border-foreground/10 ml-3 flex flex-col border-l pl-2'>{children}</div>
      </div>
    </div>
  );
}
type RowProps = {
  pathname: string;
  showPreview: (link: NavLink, element: HTMLElement) => void;
  setHover: (value: null) => void;
};
function ComponentRow({ item, pathname, showPreview, setHover }: RowProps & { item: CatalogItem }) {
  const href = itemHref('blocks', item.slug);
  const parts = item.children ?? [];
  const containsActive = pathname === href || parts.some(part => itemHref('blocks', part.slug) === pathname);
  const [open, setOpen] = React.useState(containsActive);
  const [seen, setSeen] = React.useState(pathname);
  if (seen !== pathname) {
    setSeen(pathname);
    if (containsActive) {
      setOpen(true);
    }
  }
  const panelId = React.useId();
  const link: NavLink = { href, label: item.title, slug: item.slug, comingSoon: item.soon };
  if (parts.length === 0) {
    return (
      <NavItem
        link={link}
        pathname={pathname}
        showPreview={showPreview}
        setHover={setHover}
      />
    );
  }
  const current = pathname === href;
  return (
    <div className='flex flex-col'>
      <div
        className={cn(
          'has-[:focus-visible]:ring-foreground/60 flex items-center rounded-md transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset',
          current ? 'bg-foreground/[0.06]' : 'hover:bg-foreground/[0.03]',
        )}
      >
        {item.soon ? (
          <span
            aria-disabled='true'
            onMouseEnter={event => showPreview(link, event.currentTarget)}
            onMouseLeave={() => setHover(null)}
            className='flex h-8 min-w-0 flex-1 cursor-not-allowed items-center gap-2 px-2.5 text-sm text-neutral-400 dark:text-neutral-600'
          >
            <span className='truncate'>{item.title}</span>
            <SoonBadge />
          </span>
        ) : (
          <Link
            href={href}
            aria-current={current ? 'page' : undefined}
            onMouseEnter={event => showPreview(link, event.currentTarget)}
            onMouseLeave={() => setHover(null)}
            onFocus={event => showPreview(link, event.currentTarget)}
            onBlur={() => setHover(null)}
            className={cn(
              'flex h-8 min-w-0 flex-1 items-center px-2.5 text-sm outline-none transition-colors',
              current ? 'text-foreground font-medium' : 'hover:text-foreground text-neutral-500',
            )}
          >
            {item.title}
          </Link>
        )}
        <button
          type='button'
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? 'Collapse' : 'Expand'} ${item.title}`}
          onClick={() => setOpen(value => !value)}
          className='flex size-8 shrink-0 items-center justify-center outline-none'
        >
          <Chevron open={open} />
        </button>
      </div>
      <Collapsible
        open={open}
        id={panelId}
      >
        {parts.map(part => (
          <NavItem
            key={part.slug}
            link={{ href: itemHref('blocks', part.slug), label: part.title, comingSoon: part.soon }}
            pathname={pathname}
            showPreview={showPreview}
            setHover={setHover}
          />
        ))}
      </Collapsible>
    </div>
  );
}
const flowItems = CATALOG.blocks.flatMap(category => category.groups.flatMap(group => group.items));
const pieceItems = CATALOG.components.flatMap(category => category.groups.flatMap(group => group.items));
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
        className='pointer-events-none fixed z-40 hidden transition-[top] duration-200 ease-out [animation:sidebar-preview-in_160ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:[animation:none] lg:block'
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
      className='pointer-events-none fixed z-40 hidden transition-[top] duration-200 ease-out [animation:sidebar-preview-in_160ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:[animation:none] lg:block'
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
  const home = pathname === '/';
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMobileOpen(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  const [hover, setHoverState] = React.useState<{ slug: string; top: number; comingSoon?: boolean } | null>(null);
  const timers = React.useRef({ show: 0, hide: 0 });
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const setHover = (value: null) => {
    window.clearTimeout(timers.current.show);
    window.clearTimeout(timers.current.hide);
    timers.current.hide = window.setTimeout(() => setHoverState(value), PREVIEW_GRACE);
  };
  const showPreview = (link: NavLink, element: HTMLElement) => {
    window.clearTimeout(timers.current.show);
    window.clearTimeout(timers.current.hide);
    if (!link.slug) {
      setHover(null);
      return;
    }
    const next = { slug: link.slug, top: element.getBoundingClientRect().top, comingSoon: link.comingSoon };
    if (hover) {
      setHoverState(next);
      return;
    }
    timers.current.show = window.setTimeout(() => setHoverState(next), PREVIEW_DELAY);
  };
  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      window.clearTimeout(pending.show);
      window.clearTimeout(pending.hide);
    };
  }, []);
  React.useEffect(() => {
    scrollRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' });
  }, [pathname]);
  return (
    <div className='bg-background text-foreground min-h-svh'>
      <TopNav />
      <button
        type='button'
        tabIndex={-1}
        aria-hidden='true'
        onClick={() => setMobileOpen(false)}
        className={cn('fixed inset-0 z-20 cursor-default lg:hidden', !mobileOpen && 'pointer-events-none')}
      />
      <aside
        aria-label='Site'
        style={{ width: SIDEBAR_WIDTH }}
        className={cn(
          'bg-background border-foreground/10 fixed bottom-0 left-0 top-14 z-30 flex-col border-r transition-[opacity,translate] duration-700 lg:flex',
          mobileOpen ? 'flex shadow-2xl' : 'hidden',
          home && '!hidden',
        )}
      >
        <div
          ref={scrollRef}
          className='flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4 pt-5 [scrollbar-width:none]'
        >
          <nav
            className='relative flex flex-col'
            onMouseLeave={() => setHover(null)}
          >
            <div className='flex flex-col'>
              <div className={HEADER_CLASS}>Getting started</div>
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
            <div className='mt-6 flex flex-col'>
              <Link
                href='/blocks'
                className={cn(HEADER_CLASS, 'hover:text-foreground transition-colors')}
              >
                Blocks
                <CountBadge count={flowItems.length} />
              </Link>
              {CATALOG.blocks.map(category => (
                <div
                  key={category.id}
                  className='flex flex-col'
                >
                  <div className='text-foreground/50 mt-4 px-2 pb-1 text-[12px] font-medium first:mt-1'>
                    {category.label}
                  </div>
                  {category.groups
                    .flatMap(group => group.items)
                    .map(item => (
                      <ComponentRow
                        key={item.slug}
                        item={item}
                        pathname={pathname}
                        showPreview={showPreview}
                        setHover={setHover}
                      />
                    ))}
                </div>
              ))}
            </div>
            <div className='mt-6 flex flex-col'>
              <Link
                href='/components'
                className={cn(HEADER_CLASS, 'hover:text-foreground transition-colors')}
              >
                Components
                <CountBadge count={pieceItems.length} />
                {pieceItems.every(item => item.soon) ? (
                  <span className='bg-foreground/[0.06] rounded-full px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal text-neutral-500'>
                    Soon
                  </span>
                ) : null}
              </Link>
              {pieceItems.map(item => (
                <NavItem
                  key={item.slug}
                  link={{
                    href: itemHref('components', item.slug),
                    label: item.title,
                    comingSoon: item.soon,
                    hideBadge: true,
                  }}
                  pathname={pathname}
                  showPreview={showPreview}
                  setHover={setHover}
                />
              ))}
            </div>
          </nav>
        </div>
      </aside>
      {hover ? (
        <HoverPreview
          left={SIDEBAR_WIDTH + 12}
          slug={hover.slug}
          top={hover.top}
          comingSoon={hover.comingSoon}
        />
      ) : null}
      <div className={cn('fixed bottom-4 left-4 z-40 flex items-center gap-2 lg:hidden', home && 'hidden')}>
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
      <div className={cn(!home && 'lg:pl-64')}>{children}</div>
    </div>
  );
}
