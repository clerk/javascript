'use client';

import { notFound, usePathname } from 'next/navigation';

import { findLiveEntry } from '@/lib/live-navigation';

import { LivePageHeader } from '../../../../live-page-header';

export default function LiveTodoPage() {
  const entry = findLiveEntry(usePathname());
  if (!entry) {
    notFound();
  }
  const { meta } = entry.mod;

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
      <LivePageHeader title={meta.label ?? meta.title}>
        <code className='font-mono text-xs'>{`<${meta.title} />`}</code> has no live harness yet.
      </LivePageHeader>
      <div className='bg-muted text-muted-foreground flex min-h-48 items-center justify-center rounded-lg border border-dashed p-8 text-sm'>
        TODO
      </div>
    </div>
  );
}
