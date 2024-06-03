import cn from 'clsx';
import * as React from 'react';

import { Spinner } from './spinner';

export const Button = React.forwardRef(function Button(
  {
    busy,
    children,
    className,
    disabled,
    icon,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; icon?: React.ReactNode },
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    // eslint-disable-next-line react/button-has-type
    <button
      ref={forwardedRef}
      {...props}
      className={cn(
        'text-accent-contrast bg-accent-9 border-accent-9 focus:ring-gray-a3 relative isolate inline-flex w-full select-none appearance-none items-center justify-center rounded-md border px-2 py-1.5 text-[0.8125rem]/[1.125rem] font-medium shadow-[0_1px_1px_0_theme(colors.white/.07)_inset] outline-none ring-[0.1875rem] ring-transparent before:absolute before:inset-0 before:rounded-[calc(theme(borderRadius.md)-1px)] before:shadow-[0_1px_1px_0_theme(colors.white/.07)_inset] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.md)-1px)] after:bg-gradient-to-b after:from-white/10 after:to-transparent disabled:pointer-events-none disabled:cursor-not-allowed',
        // note: only reduce opacity of `disabled` so `busy` is more prominent
        disabled && 'disabled:opacity-50',
        !busy && !disabled && 'hover:bg-accent-10 hover:after:opacity-0',
        className,
      )}
      disabled={busy || disabled}
    >
      {busy ? (
        <Spinner className='shrink-0 text-[1.125rem]'>Loading…</Spinner>
      ) : (
        <>
          {children}
          {icon && <span className='text-[0.625rem] opacity-60 shrink-0 ms-2'>{icon}</span>}
        </>
      )}
    </button>
  );
});
