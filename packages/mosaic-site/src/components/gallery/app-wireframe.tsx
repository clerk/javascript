import type * as React from 'react';

import { cn } from '@/lib/utils';
export const WIREFRAME_WIDTH = 1440;
const bar = 'bg-foreground/[0.07] rounded-md';
export function Rail() {
  return (
    <div className='border-foreground/10 flex w-[15%] shrink-0 flex-col gap-5 border-r px-5 py-5'>
      <div className='flex items-center gap-3'>
        <div className={cn(bar, 'size-7 rounded-lg')} />
        <div className={cn(bar, 'h-3 w-20')} />
      </div>
      <div className='flex flex-col gap-3 pt-3'>
        {[70, 56, 64, 48, 60].map(width => (
          <div
            key={width}
            className={cn(bar, 'h-3')}
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
      <div className='mt-auto flex items-center gap-3'>
        <div className={cn(bar, 'size-7 rounded-full')} />
        <div className={cn(bar, 'h-3 w-16')} />
      </div>
    </div>
  );
}
export function Header({ action }: { action?: React.ReactNode }) {
  return (
    <div className='border-foreground/10 flex h-14 shrink-0 items-center justify-between border-b px-6'>
      <div className='flex items-center gap-3'>
        <div className={cn(bar, 'h-3 w-16')} />
        <div className={cn(bar, 'h-3 w-3')} />
        <div className={cn(bar, 'h-3 w-24')} />
      </div>
      <div className='flex items-center gap-3'>
        {action ?? <div className={cn(bar, 'h-7 w-20 rounded-lg')} />}
        <div className={cn(bar, 'size-7 rounded-full')} />
      </div>
    </div>
  );
}
export function PageSkeleton() {
  return (
    <div className='flex flex-col gap-6 p-8'>
      <div className={cn(bar, 'h-6 w-56')} />
      <div className='grid grid-cols-3 gap-5'>
        {[0, 1, 2].map(index => (
          <div
            key={index}
            className={cn(bar, 'h-32 rounded-xl')}
          />
        ))}
      </div>
      <div className={cn(bar, 'h-3 w-3/4')} />
      <div className={cn(bar, 'h-3 w-2/3')} />
      <div className={cn(bar, 'h-3 w-1/2')} />
    </div>
  );
}
export function AppWireframe({
  width,
  modal,
  scroll = false,
  children,
}: {
  width: number;
  modal: boolean;
  scroll?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className='relative flex'
      style={{ width, height: width * 0.625 }}
    >
      <Rail />
      <div className='flex min-w-0 flex-1 flex-col'>
        <Header />
        <div
          className={cn(
            'min-h-0 flex-1',
            scroll ? 'overflow-y-auto [scrollbar-width:thin]' : 'overflow-hidden [scrollbar-width:none]',
            '[&_.cl-profile-nav]:sticky! [&_.cl-profile-nav]:top-6! [&_.cl-profile-nav]:self-start!',
          )}
        >
          {modal ? <PageSkeleton /> : <div className='px-8 pb-10 pt-6'>{children}</div>}
        </div>
      </div>
      {modal ? (
        <>
          <div className='absolute inset-0 bg-black/40' />
          <div
            className={cn(
              'ring-foreground/10 absolute left-1/2 top-1/2 h-[84%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-[var(--cl-color-page,#fff)] shadow-2xl ring-1',
              scroll ? 'overflow-y-auto [scrollbar-width:thin]' : 'overflow-hidden',
            )}
          >
            {children}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(bar, className)}
      style={style}
    />
  );
}
function MobileHeader({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className='border-foreground/10 flex h-14 shrink-0 items-center justify-between border-b bg-[var(--cl-color-page,#fff)] px-4'>
      {left ?? (
        <div className='flex items-center gap-3'>
          <Skeleton className='size-6' />
          <Skeleton className='h-3 w-20' />
        </div>
      )}
      {right ?? <Skeleton className='size-7 rounded-full' />}
    </div>
  );
}
function MobileBottom({ url }: { url: string }) {
  return (
    <div className='flex shrink-0 flex-col bg-[var(--cl-color-page,#fff)]'>
      <div className='border-foreground/10 flex h-16 items-center justify-around border-t px-4'>
        {[0, 1, 2, 3].map(index => (
          <div
            key={index}
            className='flex flex-col items-center gap-1.5'
          >
            <Skeleton className='size-5' />
            <Skeleton className='h-1.5 w-8' />
          </div>
        ))}
      </div>
      <div className='border-foreground/10 flex h-[6.25rem] flex-col gap-1 border-t px-5 pt-2.5'>
        <div className='bg-foreground/[0.07] mx-auto flex h-9 w-full items-center justify-center gap-2 rounded-full text-[13px] text-neutral-500'>
          <svg
            viewBox='0 0 24 24'
            className='size-3'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.75'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <path d='M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z' />
          </svg>
          <span className='truncate'>{url}</span>
        </div>
        <div className='flex items-center justify-between px-5 pt-1 text-neutral-500'>
          {['M15 18l-6-6 6-6', 'M9 18l6-6-6-6', 'M12 3v12M8 7l4-4 4 4M5 13v7h14v-7', 'M4 5h16v14H4zM4 9h16'].map(
            path => (
              <svg
                key={path}
                viewBox='0 0 24 24'
                className='size-4'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.75'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
              >
                <path d={path} />
              </svg>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
const fadeTop = 'linear-gradient(to bottom, transparent 0, #000 36px)';
export function MobileShell({
  url,
  headerLeft,
  headerRight,
  children,
}: {
  url: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className='text-foreground flex h-svh flex-col overflow-hidden bg-[var(--cl-color-page,#fff)]'>
      <MobileHeader
        left={headerLeft}
        right={headerRight}
      />
      <div
        className='min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 [scrollbar-width:none]'
        style={{ maskImage: fadeTop, WebkitMaskImage: fadeTop }}
      >
        {children}
      </div>
      <MobileBottom url={url} />
    </div>
  );
}
