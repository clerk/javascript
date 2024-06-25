import { cx } from 'cva';
import * as React from 'react';

import { Spinner } from './spinner';

export const SecondaryButton = React.forwardRef(function SecondaryButton(
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
      className={cx(
        'text-gray-12 border-gray-a6 shadow-gray-a3 focus-visible:ring-gray-a3 focus-visible:border-gray-a8 flex w-full items-center justify-center gap-2 rounded-md border bg-transparent bg-clip-padding px-2.5 py-1.5 text-base font-medium shadow-sm outline-none focus-visible:ring-[0.1875rem]',
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
