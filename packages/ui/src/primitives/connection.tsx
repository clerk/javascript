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
      className={cn('grid grid-cols-2 gap-2', className)}
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
        'flex items-center justify-center gap-2 w-full bg-transparent text-gray-12 font-medium rounded-md bg-clip-padding border border-gray-a6 shadow-sm shadow-gray-a3 py-1.5 px-2.5 outline-none focus-visible:ring-[0.1875rem] focus-visible:ring-gray-a3 focus-visible:border-gray-a8 disabled:cursor-not-allowed text-base',
        // note: only reduce opacity of `disabled` so `busy` is more prominent
        disabled && 'disabled:opacity-40',
        !busy && !disabled && 'hover:bg-gray-a2',
        className,
      )}
      disabled={busy || disabled}
    >
      {icon ? <span className='text-base'>{busy ? <Spinner>Loading…</Spinner> : <span>{icon}</span>}</span> : null}
      {children}
    </button>
  );
});
