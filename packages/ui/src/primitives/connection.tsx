import cn from 'clsx';
import * as React from 'react';

import { Spinner } from './spinner';

function getColumnCount<T>(items: T[], maxCols: number = 6): number {
  const numRows = Math.ceil(items.length / maxCols);
  const itemsPerRow = Math.ceil(items.length / numRows);
  const rows: T[][] = Array.from({ length: numRows }, () => []);
  let currentArrayIndex = 0;
  for (const item of items) {
    rows[currentArrayIndex].push(item);
    if (rows[currentArrayIndex].length === itemsPerRow) {
      currentArrayIndex++;
    }
  }
  return Math.max(...rows.map(row => row.length));
}

export const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    columns?: number;
  }
>(function Root({ children, className, ...props }, forwardedRef) {
  const cols = getColumnCount(React.Children.toArray(children));
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn(
        'flex items-center justify-center flex-wrap [--cl-connection-gap:theme(spacing.2)] gap-y-[--cl-connection-gap] -mx-1',
        className,
      )}
      style={{ '--cl-connection-cols': cols } as React.CSSProperties}
    >
      {children}
    </div>
  );
});

export const Button = React.forwardRef(function Button(
  {
    busy,
    children,
    className,
    disabled,
    icon,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode; busy?: boolean },
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <div className='w-[calc(100%/var(--cl-connection-cols))] px-[calc(var(--cl-connection-gap)/2)]'>
      {/* eslint-disable react/button-has-type */}
      <button
        ref={forwardedRef}
        {...props}
        className={cn(
          'min-w-0 w-full flex items-center justify-center gap-2 bg-transparent text-gray-12 font-medium rounded-md bg-clip-padding border border-gray-a6 shadow-sm shadow-gray-a3 py-1.5 px-2.5 outline-none focus-visible:ring-[0.1875rem] focus-visible:ring-gray-a3 focus-visible:border-gray-a8 text-base',
          busy ? 'cursor-wait' : disabled ? 'disabled:cursor-not-allowed disabled:opacity-50' : 'hover:bg-gray-a2',
          className,
        )}
        disabled={busy || disabled}
      >
        {icon ? <span className='text-base'>{busy ? <Spinner>Loading…</Spinner> : <span>{icon}</span>}</span> : null}
        <span className='sr-only'>{children}</span>
      </button>
    </div>
  );
});
