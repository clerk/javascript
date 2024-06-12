import cn from 'clsx';
import * as React from 'react';

import { Spinner } from './spinner';

function getColumnCount(itemsLength: number, maxCols: number = 6): number {
  const numRows = Math.ceil(itemsLength / maxCols);
  return Math.ceil(itemsLength / numRows);
}

export const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    columns?: number;
  }
>(function Root({ children, className, ...props }, forwardedRef) {
  const cols = getColumnCount(React.Children.count(children));
  return (
    <div>
      <div
        ref={forwardedRef}
        {...props}
        className={cn(
          '-m-[calc(var(--cl-connection-gap)/2)] flex flex-wrap items-center justify-center [--cl-connection-gap:theme(spacing.2)]',
          className,
        )}
        style={{ '--cl-connection-cols': cols } as React.CSSProperties}
      >
        {children}
      </div>
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
    textVisuallyHidden = false,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ReactNode;
    busy?: boolean;
    /**
     * When true, the text provided in children prop will be visually hidden
     * but still accessible to screen readers.
     */
    textVisuallyHidden?: boolean;
  },
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <div className='w-[calc(100%/var(--cl-connection-cols))] p-[calc(var(--cl-connection-gap)/2)]'>
      {/* eslint-disable react/button-has-type */}
      <button
        ref={forwardedRef}
        {...props}
        className={cn(
          'text-gray-12 border-gray-a6 shadow-gray-a3 focus-visible:ring-gray-a3 focus-visible:border-gray-a8 flex min-h-8 w-full min-w-0 items-center justify-center gap-2 rounded-md border bg-transparent bg-clip-padding px-2.5 py-1.5 text-base font-medium shadow-sm outline-none focus-visible:ring-[0.1875rem]',
          busy ? 'cursor-wait' : disabled ? 'disabled:cursor-not-allowed disabled:opacity-50' : 'hover:bg-gray-a2',
          className,
        )}
        disabled={busy || disabled}
      >
        {icon ? <span className='text-base'>{busy ? <Spinner>Loading…</Spinner> : <span>{icon}</span>}</span> : null}
        <span
          className={cn({
            'sr-only': textVisuallyHidden,
          })}
          aria-hidden={busy}
        >
          {children}
        </span>
      </button>
    </div>
  );
});
