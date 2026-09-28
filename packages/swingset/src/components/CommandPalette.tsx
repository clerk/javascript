'use client';

import { Dialog } from '@base-ui/react/dialog';
import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { useSidebar } from '@/components/ui/sidebar';
import { getSidebarGroups } from '@/lib/registry';
import { cn } from '@/lib/utils';

type PaletteEntry = {
  href?: string;
  title: string;
  hint?: string;
  group: string;
  search: string;
  run?: () => void;
};

function usage(group: string, title: string) {
  if (group === 'Hooks') {
    return `${title}()`;
  }
  if (group === 'Styles' || group === 'Localization') {
    return title;
  }
  return `<${title} />`;
}

const navigationEntries: PaletteEntry[] = [
  ...getSidebarGroups().flatMap(({ group, groupSlug, components }) =>
    components.map(({ mod, componentSlug }) => {
      const { title, label } = mod.meta;
      return {
        href: `/${groupSlug}/${componentSlug}`,
        title,
        hint: label ?? usage(group, title),
        group,
        search: `${title} ${label ?? ''} ${group} ${groupSlug} ${componentSlug}`.toLowerCase(),
      };
    }),
  ),
  { href: '/live', title: 'Live Sandbox', group: 'Sandbox', search: 'live sandbox /live' },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  const entries = [
    ...navigationEntries,
    {
      title: 'Toggle dark mode',
      group: 'Appearance',
      search: 'toggle dark mode theme appearance',
      run: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    },
    {
      title: 'Toggle sidebar',
      group: 'Appearance',
      search: 'toggle sidebar collapse expand',
      run: toggleSidebar,
    },
  ];
  const q = query.trim().toLowerCase();
  const results = q ? entries.filter(entry => entry.search.includes(q)) : entries;

  React.useEffect(() => {
    setActiveIndex(0);
  }, [q]);

  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  React.useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, q]);

  const select = (entry: PaletteEntry | undefined) => {
    if (!entry) {
      return;
    }
    onOpenChange(false);
    if (entry.run) {
      entry.run();
      return;
    }
    if (entry.href) {
      router.push(entry.href);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!results.length) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(index => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      select(results[activeIndex]);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className='data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 dark:bg-black/60' />
        <Dialog.Popup className='bg-popover text-popover-foreground data-ending-style:opacity-0 data-ending-style:scale-98 data-starting-style:opacity-0 data-starting-style:scale-98 fixed left-1/2 top-[18vh] z-50 flex max-h-[min(50vh,600px)] w-[92vw] max-w-lg -translate-x-1/2 flex-col overflow-hidden rounded-lg border shadow-2xl transition duration-150'>
          <Dialog.Title className='sr-only'>Command palette</Dialog.Title>
          <div className='flex items-center gap-2 border-b px-3'>
            <SearchIcon className='text-muted-foreground size-4 shrink-0' />
            <input
              autoFocus
              type='text'
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder='Type a command or search…'
              aria-label='Search commands'
              className='placeholder:text-muted-foreground w-full bg-transparent py-3 text-sm outline-none'
            />
            <kbd className='text-muted-foreground hidden shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block'>
              ESC
            </kbd>
          </div>
          <div
            ref={listRef}
            role='listbox'
            className='min-h-0 flex-1 overflow-y-auto p-1'
          >
            {results.length === 0 ? (
              <p className='text-muted-foreground px-3 py-6 text-center text-xs'>No results</p>
            ) : (
              results.map((entry, index) => {
                const previous = results[index - 1];
                const startsGroup = !previous || previous.group !== entry.group;
                return (
                  <React.Fragment key={entry.href ?? entry.title}>
                    {startsGroup && (
                      <p className='text-muted-foreground px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide'>
                        {entry.group}
                      </p>
                    )}
                    <button
                      type='button'
                      role='option'
                      aria-selected={index === activeIndex}
                      onClick={() => select(entry)}
                      onMouseMove={() => setActiveIndex(index)}
                      className={cn(
                        'text-foreground hover:bg-accent hover:text-accent-foreground group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs',
                        index === activeIndex && 'bg-accent text-accent-foreground',
                      )}
                    >
                      <span className='min-w-0 truncate'>{entry.title}</span>
                      {entry.hint && (
                        <span className='text-muted-foreground group-aria-selected:text-accent-foreground/70 max-w-[11rem] shrink truncate font-mono text-[9px]'>
                          {entry.hint}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })
            )}
          </div>
          <div className='text-muted-foreground flex items-center gap-3 border-t px-3 py-2 text-[10px]'>
            <span className='flex items-center gap-1'>
              <kbd className='rounded border px-1 py-0.5'>↑</kbd>
              <kbd className='rounded border px-1 py-0.5'>↓</kbd> Navigate
            </span>
            <span className='flex items-center gap-1'>
              <kbd className='rounded border px-1 py-0.5'>↵</kbd> Select
            </span>
            <span className='flex items-center gap-1'>
              <kbd className='rounded border px-1 py-0.5'>⌘</kbd>
              <kbd className='rounded border px-1 py-0.5'>K</kbd> Toggle
            </span>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
