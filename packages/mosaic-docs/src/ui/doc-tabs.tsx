import Link from 'next/link';

import type { DocTab } from '@/core/doc-sections';

const tabs = [
  { tab: 'overview', label: 'Overview' },
  { tab: 'properties', label: 'Properties' },
] as const;

export function DocTabList({ href, selected }: { href: string; selected: DocTab }) {
  return (
    <nav
      aria-label='Page sections'
      className='not-prose border-border mb-8 flex gap-5 border-b'
    >
      {tabs.map(({ tab, label }) => (
        <Link
          key={tab}
          href={tab === 'properties' ? `${href}/properties` : href}
          scroll={false}
          aria-current={tab === selected ? 'page' : undefined}
          className='text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:after:bg-foreground relative pb-2.5 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-0.5'
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
