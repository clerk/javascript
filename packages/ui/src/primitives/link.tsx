import { cva, type VariantProps } from 'cva';
import * as React from 'react';

export const linkButton = cva({
  base: 'text-accent-9 -mx-0.5 rounded-sm px-0.5 font-medium outline-none',
  variants: {
    busy: {
      false: null,
      true: 'cursor-wait opacity-50',
    },
    disabled: {
      false: null,
      true: 'disabled:cursor-not-allowed disabled:opacity-50',
    },
    // Override native behaviour for third-party packages
    // e.g. react-aria-components
    focusVisible: {
      native: 'focus-visible:ring-default',
      'data-attribute': 'data-[focus-visible]:ring-default',
    },
    size: {
      sm: 'text-sm',
      base: 'text-base',
    },
  },
  compoundVariants: [
    {
      busy: false,
      disabled: false,
      className: 'hover:underline',
    },
  ],
  defaultVariants: {
    busy: false,
    disabled: false,
    focusVisible: 'native',
    size: 'base',
  },
});

export const LinkButton = React.forwardRef(function LinkButton(
  {
    busy,
    children,
    className,
    disabled,
    size,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    busy?: VariantProps<typeof linkButton>['busy'];
    size?: VariantProps<typeof linkButton>['size'];
  },
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    // eslint-disable-next-line react/button-has-type
    <button
      ref={forwardedRef}
      {...props}
      className={linkButton({ busy, disabled, size, className })}
      disabled={busy || disabled}
    >
      {children}
    </button>
  );
});
