import cn from 'clsx';
import * as React from 'react';

import { Spinner } from './spinner';

export const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Root(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn(
        '[--cl-connection-gap:theme(spacing.2)]',
        '[--cl-connection-cols:2]',
        'flex gap-[--cl-connection-gap] flex-wrap items-center justify-center',
        className,
      )}
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
    // eslint-disable-next-line react/button-has-type
    <button
      ref={forwardedRef}
      {...props}
      className={cn(
        'w-[calc((100%/var(--cl-connection-cols))-var(--cl-connection-gap))] ',
        'min-w-0 flex items-center justify-center gap-2 bg-transparent text-gray-12 font-medium rounded-md bg-clip-padding border border-gray-a6 shadow-sm shadow-gray-a3 py-1.5 px-2.5 outline-none focus-visible:ring-[0.1875rem] focus-visible:ring-gray-a3 focus-visible:border-gray-a8 text-base',
        busy ? 'cursor-wait' : disabled ? 'disabled:cursor-not-allowed disabled:opacity-50' : 'hover:bg-gray-a2',
        className,
      )}
      disabled={busy || disabled}
    >
      {icon ? <span className='text-base'>{busy ? <Spinner>Loading…</Spinner> : <span>{icon}</span>}</span> : null}
      {children}
    </button>
  );
});
