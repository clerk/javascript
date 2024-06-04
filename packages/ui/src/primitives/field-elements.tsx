import * as ClerkCommon from '@clerk/elements/common';
import cn from 'clsx';
import * as React from 'react';

// Revert back to asChild and create PasswordField component
// https://github.com/clerk/javascript/pull/3503#issuecomment-2147613109
import * as Icon from './icon';

export const Root = React.forwardRef(function Field(
  { children, className, ...props }: React.ComponentProps<typeof ClerkCommon.Field>,
  ref: React.ForwardedRef<React.ComponentRef<typeof ClerkCommon.Field>>,
) {
  return (
    <ClerkCommon.Field
      ref={ref}
      className={cn('has-[[data-field-input][disabled]]:[--cl-field-label-opacity:0.5]', 'space-y-2', className)}
      {...props}
    >
      {children}
    </ClerkCommon.Field>
  );
});

export const Label = React.forwardRef(function Label(
  { children, className, ...props }: React.ComponentProps<typeof ClerkCommon.Label>,
  ref: React.ForwardedRef<React.ComponentRef<typeof ClerkCommon.Label>>,
) {
  return (
    <ClerkCommon.Label
      ref={ref}
      className={cn(
        'text-[0.8125rem]/[1.125rem] font-medium flex items-center text-gray-12 gap-x-1 opacity-[--cl-field-label-opacity,1]',
        className,
      )}
      {...props}
    >
      {children}
    </ClerkCommon.Label>
  );
});

export const Input = React.forwardRef(function Input(
  { children, className, ...props }: React.ComponentProps<typeof ClerkCommon.Input>,
  ref: React.ForwardedRef<React.ComponentRef<typeof ClerkCommon.Input>>,
) {
  return (
    <ClerkCommon.FieldState>
      {({ state }) => (
        <ClerkCommon.Input
          ref={ref}
          className={cn(
            'block w-full bg-white text-gray-12 rounded-md bg-clip-padding py-1.5 px-2.5 border border-gray-a6 outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[0.8125rem]/[1.125rem]',
            'focus:ring-[0.1875rem]',
            // idle
            state !== 'error' && state !== 'success' && 'hover:border-gray-a8 focus:ring-gray-a3 focus:border-gray-a8',
            // invalid
            "data-[invalid='true']:border-destructive data-[invalid='true']:focus:ring-destructive/30",
            // error
            state === 'error' && 'border-destructive focus:ring-destructive/30',
            // success
            state === 'success' && 'border-[#10b981] focus:ring-[#10b981]/30',
            className,
          )}
          {...props}
        >
          {children}
        </ClerkCommon.Input>
      )}
    </ClerkCommon.FieldState>
  );
});

function MessageInner({
  children,
  intent,
}: {
  children?: React.ReactNode;
  code?: string;
  intent: 'success' | 'error' | 'warning' | 'info';
}) {
  return (
    <div
      className={cn(
        'flex gap-1',
        // note: we can't use an object here to get the relevant intent as our
        // tailwind-transformer doesn't support it
        intent === 'error' && 'text-destructive',
        intent === 'info' && 'text-gray-11',
        intent === 'success' && 'text-[#10b981]',
        intent === 'warning' && 'text-yellow-500',
      )}
    >
      <span className='text-base mt-px'>
        {
          {
            error: <Icon.ExclamationOctagonSm />,
            info: <Icon.InformationLegacy />,
            success: <Icon.CheckmarkCircleSm />,
            warning: <Icon.ExclamationTriangleSm />,
          }[intent]
        }
      </span>

      <span className='text-[0.8125rem]/[1.125rem]'>{children}</span>
    </div>
  );
}

// Note: only display when blurred?
export const Message = React.forwardRef(function FieldError(_, ref: React.ForwardedRef<HTMLDivElement>) {
  return (
    <div ref={ref}>
      <ClerkCommon.FieldError>
        {({ message }) => <MessageInner intent='error'>{message}</MessageInner>}
      </ClerkCommon.FieldError>
      <ClerkCommon.FieldState>
        {({ state, message }) => (state !== 'idle' ? <MessageInner intent={state}>{message}</MessageInner> : null)}
      </ClerkCommon.FieldState>
    </div>
  );
});
