import type { VariantProps } from 'cva';
import { cva, cx } from 'cva';
import * as React from 'react';

import { Spinner } from './spinner';

const button = cva({
  base: [
    '[--button-border-width:1px]',
    '[--button-icon-size:calc(var(--cl-font-size)*1.24)]', // 16px
    'appearance-none relative isolate select-none',
    'text-base font-medium',
    'px-[calc(theme(spacing.3)-var(--button-border-width))] py-[calc(theme(spacing[1.5])-var(--button-border-width))]',
    'min-h-[1.875rem]',
    'inline-flex w-full items-center justify-center gap-3',
    'border-[length:--button-border-width] rounded-md bg-clip-padding',
    'outline-none focus-visible:ring',
    '*:min-w-0',
  ],
  variants: {
    intent: {
      primary: [
        '[--button-icon-color:currentColor]',
        '[--button-icon-opacity:0.6]',
        'text-accent-contrast bg-accent-9 border-accent-9 shadow-[0_1px_1px_0_theme(colors.white/.07)_inset]',
        'before:absolute before:inset-0 before:rounded-[calc(theme(borderRadius.md)-1px)] before:shadow-[0_1px_1px_0_theme(colors.white/.07)_inset]',
        'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.md)-1px)] after:bg-gradient-to-b after:from-white/10 after:to-transparent',
        'focus-visible:ring-accent-a7',
      ],
      secondary: [
        '[--button-icon-color:theme(colors.gray.12)]',
        '[--button-icon-opacity:1]',
        'text-gray-12 border-gray-a6 bg-gray-surface shadow-sm shadow-gray-a3',
        'focus-visible:border-gray-a8 focus-visible:ring-accent-a3',
      ],
      // Note:
      // This currently looks the same as `secondary`, but we've intentfully
      // kept this as a separate variant for now, due to its nuances in `busy`
      // behavior
      connection: [
        '[--button-icon-color:theme(colors.gray.12)]',
        '[--button-icon-opacity:1]',
        'text-gray-12 border-gray-a6 bg-gray-surface shadow-sm shadow-gray-a3',
        'focus-visible:border-gray-a8 focus-visible:ring-accent-a3',
      ],
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
    { busy: false, disabled: false, intent: 'connection', className: 'hover:bg-gray-2' },
    { busy: false, disabled: true, className: 'disabled:cursor-not-allowed disabled:opacity-50' },
    { busy: true, disabled: false, className: 'cursor-wait' },
  ],
});

export const Button = React.forwardRef(function Button(
  {
    busy = false,
    children,
    className,
    disabled = false,
    iconStart,
    iconEnd,
    intent = 'primary',
    type = 'button',
    textVisuallyHidden,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> &
    // Omit types supplied via ButtonHTMLAttributes
    Omit<VariantProps<typeof button>, 'disabled'> & {
      iconStart?: React.ReactNode;
      iconEnd?: React.ReactNode;
      textVisuallyHidden?: boolean;
    },
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const spinner = (
    <Spinner className='shrink-0 text-[length:--button-icon-size] text-[--button-icon-color]'>Loading…</Spinner>
  );

  return (
    <button
      data-button=''
      ref={forwardedRef}
      className={button({ busy, disabled, intent, className })}
      disabled={busy || disabled}
      // eslint-disable-next-line react/button-has-type
      type={type}
      {...props}
    >
      {busy && intent === 'primary' ? (
        spinner
      ) : (
        <>
          {iconStart ? (
            busy && intent === 'connection' ? (
              spinner
            ) : (
              <span
                data-button-icon=''
                className='shrink-0 text-[length:--button-icon-size] text-[--button-icon-color] opacity-[--button-icon-opacity]'
              >
                {iconStart}
              </span>
            )
          ) : null}
          {children ? <span className={cx('truncate', textVisuallyHidden && 'sr-only')}>{children}</span> : null}
          {iconEnd ? (
            <span
              data-button-icon=''
              className='shrink-0 text-[length:--button-icon-size] text-[--button-icon-color] opacity-[--button-icon-opacity]'
            >
              {iconEnd}
            </span>
          ) : null}
        </>
      )}
    </button>
  );
});
