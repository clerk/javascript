import { cx } from 'cva';
import * as React from 'react';

import type { ParsedElementsFragment } from '~/contexts/AppearanceContext';
import { useAppearance } from '~/contexts/AppearanceContext';
import { applyDescriptors, dva, type VariantProps } from '~/utils/dva';

import { Spinner } from './spinner';

// Note:
// - To create the overlapping border/shadow effect"
//   - `ring` – "focus ring"
//   - `ring-offset` - border

export const layoutStyle = {
  button: {
    className: [
      '[--button-icon-size:calc(var(--cl-font-size)*1.24)]', // 16px
      'appearance-none relative isolate select-none',
      'text-base font-medium',
      'px-3 py-1.5',
      'min-h-[1.875rem]',
      'inline-flex w-full items-center justify-center gap-3',
      'ring ring-offset-1 rounded-md',
      '[&:not(:focus-visible)]:ring-transparent',
      'outline-none',
      '*:min-w-0',
    ].join(' '),
  },
  buttonPrimary: {},
  buttonSecondary: {},
  buttonConnection: {},
  buttonPrimaryDefault: {},
  buttonSecondaryDefault: {},
  buttonConnectionDefault: {},
  buttonDisabled: {},
  buttonWait: {},
  buttonConnection__google: {},
} satisfies ParsedElementsFragment;

export const visualStyle = {
  button: {},
  buttonPrimary: {
    className: [
      '[--button-icon-color:currentColor]',
      '[--button-icon-opacity:0.6]',
      'text-accent-contrast bg-accent-9 ring-offset-accent-9',
      'shadow-[0px_1px_1px_0px_theme(colors.white/.07)_inset,0px_2px_3px_0px_theme(colors.gray.a7),0px_1px_1px_0px_theme(colors.gray.a9)]',
      'before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[0_1px_1px_0_theme(colors.white/.07)_inset]',
      'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-gradient-to-b after:from-white/10 after:to-transparent',
    ].join(' '),
  },
  buttonSecondary: {
    className: [
      '[--button-icon-color:theme(colors.gray.12)]',
      '[--button-icon-opacity:1]',
      'text-gray-12 bg-gray-surface ring-light ring-offset-gray-a4',
      'shadow-[0px_1px_0px_0px_theme(colors.gray.a2),0px_2px_3px_-1px_theme(colors.gray.a3)]',
    ].join(' '),
  },
  buttonConnection: {
    className: [
      '[--button-icon-color:theme(colors.gray.12)]',
      '[--button-icon-opacity:1]',
      'text-gray-12 bg-gray-surface ring-light ring-offset-gray-a4',
      'shadow-[0px_1px_0px_0px_theme(colors.gray.a2),0px_2px_3px_-1px_theme(colors.gray.a3)]',
    ].join(' '),
  },
  buttonPrimaryDefault: {
    className: 'hover:bg-accent-10 hover:after:opacity-0',
  },
  buttonSecondaryDefault: {
    className: 'hover:bg-gray-2',
  },
  buttonConnectionDefault: {
    className: 'hover:bg-gray-2',
  },
  buttonDisabled: {
    className: 'disabled:cursor-not-allowed disabled:opacity-50',
  },
  buttonWait: {
    className: 'cursor-wait',
  },
  buttonConnection__google: {},
} satisfies ParsedElementsFragment;

const button = dva({
  base: 'button',
  variants: {
    intent: {
      primary: 'buttonPrimary',
      secondary: 'buttonSecondary',
      connection: 'buttonConnection',
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
    { busy: false, disabled: false, intent: 'primary', descriptor: 'buttonPrimaryDefault' },
    { busy: false, disabled: false, intent: 'secondary', descriptor: 'buttonSecondaryDefault' },
    { busy: false, disabled: false, intent: 'connection', descriptor: 'buttonConnectionDefault' },
    { busy: false, disabled: true, descriptor: 'buttonDisabled' },
    { busy: true, disabled: false, descriptor: 'buttonWait' },
  ],
});

export const Button = React.forwardRef(function Button(
  {
    busy = false,
    children,
    descriptor,
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
  const { elements } = useAppearance().parsedAppearance;
  const spinner = (
    <Spinner className='shrink-0 text-[length:--button-icon-size] text-[--button-icon-color]'>Loading…</Spinner>
  );

  return (
    <button
      data-button=''
      ref={forwardedRef}
      {...applyDescriptors(elements, button({ busy, disabled, intent, descriptor }))}
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
          {children ? (
            <span className={cx('truncate leading-4', textVisuallyHidden && 'sr-only')}>{children}</span>
          ) : null}
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
