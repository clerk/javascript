'use client';

import { Dialog } from '@base-ui/react/dialog';
import { FlaskConicalIcon, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { StatusDot } from '@/components/StatusDot';
import { getSidebarGroups } from '@/lib/registry';
import type { StoryStatus, WipSubstatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type PaletteEntry = {
  href: string;
  title: string;
  label: string;
  group: string;
  status?: StoryStatus;
  substatus?: WipSubstatus;
  search: string;
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

const entries: PaletteEntry[] = [
  ...getSidebarGroups().flatMap(({ group, groupSlug, components }) =>
    components.map(({ mod, componentSlug }) => {
      const { title, label, status, substatus } = mod.meta;
      return {
        href: `/${groupSlug}/${componentSlug}`,
        title,
        label: label ?? usage(group, title),
        group,
        status,
        substatus,
        search: `${title} ${label ?? ''}`.toLowerCase(),
      };
    }),
  ),
  { href: '/live', title: 'Live Sandbox', label: 'Live Sandbox', group: 'Sandbox', search: 'live sandbox' },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

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
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const select = (entry: PaletteEntry | undefined) => {
    if (!entry) {
      return;
    }
    router.push(entry.href);
    onOpenChange(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(index => Math.min(results.length - 1, index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => Math.max(0, index - 1));
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
        <Dialog.Backdrop className='data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50 bg-black/20 transition-opacity duration-150' />
        <Dialog.Popup className='bg-popover text-popover-foreground data-ending-style:opacity-0 data-ending-style:scale-98 data-starting-style:opacity-0 data-starting-style:scale-98 fixed left-1/2 top-[15vh] z-50 flex max-h-[70vh] w-[92vw] max-w-lg -translate-x-1/2 flex-col overflow-hidden rounded-xl border shadow-lg transition duration-150'>
          <Dialog.Title className='sr-only'>Search components</Dialog.Title>
          <div className='flex items-center gap-2 border-b px-3'>
            <SearchIcon className='text-muted-foreground size-4 shrink-0' />
            <input
              autoFocus
              type='text'
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder='Search components, pages…'
              aria-label='Search components'
              className='placeholder:text-muted-foreground h-11 w-full bg-transparent text-sm outline-none'
            />
            <kbd className='text-muted-foreground bg-muted hidden shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block'>
              esc
            </kbd>
          </div>
          <div
            ref={listRef}
            className='overflow-y-auto p-1.5'
          >
            {results.length === 0 ? (
              <p className='text-muted-foreground px-3 py-6 text-center text-xs'>No matches for “{query.trim()}”.</p>
            ) : (
              results.map((entry, index) => (
                <button
                  key={entry.href}
                  type='button'
                  data-active={index === activeIndex}
                  onClick={() => select(entry)}
                  onMouseMove={() => setActiveIndex(index)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm',
                    index === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground',
                  )}
                >
                  {entry.status ? (
                    <StatusDot
                      status={entry.status}
                      substatus={entry.substatus}
                    />
                  ) : entry.group === 'Sandbox' ? (
                    <FlaskConicalIcon className='text-muted-foreground size-3.5 shrink-0' />
                  ) : (
                    <span className='size-2 shrink-0' />
                  )}
                  <span className='truncate'>{entry.label}</span>
                  <span className='text-muted-foreground ml-auto shrink-0 text-[10px] uppercase tracking-wider'>
                    {entry.group}
                  </span>
                </button>
              ))
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
