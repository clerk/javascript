'use client';

import type { ReactNode } from 'react';

import { AddressBar } from '@/components/address-bar';

export function DemoPage({ title, children, intro }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-8'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-semibold'>{title}</h1>
        <div className='text-muted-foreground flex flex-col gap-2 text-sm'>{intro}</div>
      </div>
      <AddressBar />
      {children}
    </div>
  );
}
