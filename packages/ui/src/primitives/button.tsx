import type { VariantProps } from 'cva';
import { cva } from 'cva';
import * as React from 'react';

import { Spinner } from './spinner';

const button = cva({
  base: [
    'appearance-none relative isolate select-none',
    'text-base font-medium',
    'px-3 py-1.5',
    'inline-flex w-full items-center justify-center gap-2',
    'border rounded-md',
    'outline-none focus-visible:ring-default',
    '*:min-w-0',
  ],
  variants: {
    intent: {
      primary: [
        'text-accent-contrast bg-accent-9 border-accent-9 shadow-[0_1px_1px_0_theme(colors.white/.07)_inset]',
        'before:absolute before:inset-0 before:rounded-[calc(theme(borderRadius.md)-1px)] before:shadow-[0_1px_1px_0_theme(colors.white/.07)_inset]',
        'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.md)-1px)] after:bg-gradient-to-b after:from-white/10 after:to-transparent',
        // ! TODO
        // could clash, explore
        'focus-visible:ring-gray-a9',
      ],
      secondary: [
        'bg-clip-padding',
        'text-gray-12 border-gray-a6 bg-gray-surface shadow-sm shadow-gray-a3',
        'focus-visible:border-gray-a8 focus-visible:ring-gray-a3',
      ],
      // ! TODO
      ghost: [],
    },
    busy: {
      false: null,
      true: null,
    },
    disabled: {
      false: null,
      true: null,
    },
  },
  compoundVariants: [
    { busy: false, disabled: false, intent: 'primary', className: 'hover:bg-accent-10 hover:after:opacity-0' },
    { busy: false, disabled: false, intent: 'secondary', className: 'hover:bg-gray-2' },
    { busy: false, disabled: true, className: 'disabled:cursor-not-allowed disabled:opacity-50' },
    { busy: true, disabled: false, className: 'cursor-wait' },
  ],
  defaultVariants: {
    busy: false,
    disabled: false,
    intent: 'primary',
  },
});

export const Button = React.forwardRef(function Button(
  {
    busy,
    children,
    className,
    disabled,
    icon,
    intent,
    type = 'button',
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> &
    // Omit types supplied via ButtonHTMLAttributes
    Omit<VariantProps<typeof button>, 'disabled'> & { icon?: React.ReactNode },
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={forwardedRef}
      className={button({ busy, disabled, intent, className })}
      disabled={busy || disabled}
      // eslint-disable-next-line react/button-has-type
      type={type}
      {...props}
    >
      {busy ? (
        <Spinner className='shrink-0 text-[1.125rem]'>Loading…</Spinner>
      ) : (
        <>
          <span className='truncate'>{children}</span>
          {icon && <span className='shrink-0 text-[0.625rem] text-inherit opacity-60'>{icon}</span>}
        </>
      )}
    </button>
  );
});
