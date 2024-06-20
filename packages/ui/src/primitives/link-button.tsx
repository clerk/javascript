import { cva, type VariantProps } from 'cva';
import * as React from 'react';

export const linkButton = cva({
  base: 'text-accent-9 focus-visible:ring-default -mx-0.5 rounded-sm px-0.5 font-medium outline-none focus-visible:ring-[0.125rem]',
  variants: {
    busy: {
      false: null,
      true: 'cursor-wait opacity-50',
    },
    disabled: {
      false: null,
      true: 'disabled:cursor-not-allowed disabled:opacity-50',
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
