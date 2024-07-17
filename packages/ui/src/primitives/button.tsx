import type { VariantProps } from 'cva';
import { cva } from 'cva';
import * as React from 'react';

import type { DistributiveOmit } from '~/types/utils';
import { fixedForwardRef } from '~/utils/fixed-forward-ref';

import { Spinner } from './spinner';

const button = cva({
  base: 'text-accent-contrast bg-accent-9 border-accent-9 focus-visible:ring-gray-a3 relative isolate inline-flex w-full select-none appearance-none items-center justify-center rounded-md border px-2 py-1.5 text-base font-medium shadow-[0_1px_1px_0_theme(colors.white/.07)_inset] outline-none ring-[0.1875rem] ring-transparent before:absolute before:inset-0 before:rounded-[calc(theme(borderRadius.md)-1px)] before:shadow-[0_1px_1px_0_theme(colors.white/.07)_inset] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.md)-1px)] after:bg-gradient-to-b after:from-white/10 after:to-transparent',
  variants: {
    busy: {
      false: null,
      true: null,
    },
    disabled: {
      false: null,
      true: [
        // For elements we want to "disable" that aren't compatible with a
        // `disabled` attribute (e.g. `a`)
        '[&:not(:is(button))]:pointer-events-none',
      ],
    },
  },
  compoundVariants: [
    {
      busy: false,
      disabled: false,
      className: 'hover:bg-accent-10 hover:after:opacity-0',
    },
    {
      busy: true,
      disabled: false,
      className: 'cursor-wait',
    },
    {
      busy: false,
      disabled: true,
      className: 'cursor-not-allowed opacity-50',
    },
  ],
});

const DEFAULT_ELEMENT = 'button';

function UnwrappedButton<TAs extends React.ElementType>({
  as,
  busy = false,
  children,
  className,
  disabled = false,
  icon,
  ...props
}: DistributiveOmit<
  React.ComponentPropsWithRef<React.ElementType extends TAs ? typeof DEFAULT_ELEMENT : TAs>,
  'as' | 'disabled'
> &
  VariantProps<typeof button> & { as?: TAs; icon?: React.ReactNode }) {
  const Element = as || DEFAULT_ELEMENT;

  return (
    <Element
      className={button({ busy, disabled, className })}
      disabled={Element === 'button' ? busy || disabled : undefined}
      {...props}
    >
      {busy ? (
        <Spinner className='shrink-0 text-[1.125rem]'>Loading…</Spinner>
      ) : (
        <>
          {children}
          {icon && <span className='ms-2 shrink-0 text-[0.625rem] opacity-60'>{icon}</span>}
        </>
      )}
    </Element>
  );
}

export const Button = fixedForwardRef(UnwrappedButton);
