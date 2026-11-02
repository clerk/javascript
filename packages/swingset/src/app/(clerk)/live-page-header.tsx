'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/StatusDot';
import { findLiveEntry } from '@/lib/live-navigation';

export function LivePageHeader({ title, children }: { title: string; children?: ReactNode }) {
  const entry = findLiveEntry(usePathname());
  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-center gap-3'>
        <h1 className='text-xl font-semibold'>{title}</h1>
        {entry?.status ? (
          <StatusBadge
            status={entry.status}
            substatus={entry.substatus}
          />
        ) : null}
      </div>
      {children ? <p className='text-muted-foreground text-sm'>{children}</p> : null}
    </div>
  );
}
