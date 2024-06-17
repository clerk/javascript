import cn from 'clsx';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

export const LinkToggleButton = React.forwardRef(function LinkToggleButton(
  {
    busy,
    isDisabled: disabled,
    className,
    size = 'base',
    ...props
  }: React.ComponentProps<typeof ToggleButton> & { busy?: boolean; size?: 'sm' | 'base' },
  forwardedRef: React.ForwardedRef<React.ComponentRef<typeof ToggleButton>>,
) {
  return (
    <ToggleButton
      ref={forwardedRef}
      // Note:
      // These styles should be manually kept in sync with `LinkButton`
      className={cn(
        'text-accent-9 focus-visible:ring-default -mx-0.5 rounded-sm px-0.5 font-medium outline-none focus-visible:ring-[0.125rem]',
        { sm: 'text-sm', base: 'text-base' }[size],
        busy
          ? 'cursor-wait opacity-50'
          : disabled
            ? 'disabled:cursor-not-allowed disabled:opacity-50'
            : 'hover:underline',
        className,
      )}
      isDisabled={busy || disabled}
      {...props}
    />
  );
});

export const LinkButton = React.forwardRef(function LinkButton(
  {
    busy,
    children,
    className,
    disabled,
    icon,
    size = 'base',
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode; busy?: boolean; size?: 'sm' | 'base' },
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    // eslint-disable-next-line react/button-has-type
    <button
      ref={forwardedRef}
      {...props}
      // Note:
      // These styles should be manually kept in sync with `LinkToggleButton`
      className={cn(
        'text-accent-9 focus-visible:ring-default -mx-0.5 rounded-sm px-0.5 font-medium outline-none focus-visible:ring-[0.125rem]',
        { sm: 'text-sm', base: 'text-base' }[size],
        busy
          ? 'cursor-wait opacity-50'
          : disabled
            ? 'disabled:cursor-not-allowed disabled:opacity-50'
            : 'hover:underline',
        className,
      )}
      disabled={busy || disabled}
    >
      {children}
    </button>
  );
});
