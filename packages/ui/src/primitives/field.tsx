import { Slot } from '@radix-ui/react-slot';
import cn from 'clsx';
import * as React from 'react';

import * as Icon from './icon';

type FieldIntent = 'error' | 'idle' | 'info' | 'success' | 'warning';

export const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Root(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('has-[[data-field-input][disabled]]:[--cl-field-label-opacity:0.5]', 'space-y-2', className)}
    >
      {children}
    </div>
  );
});

export const Label = React.forwardRef<HTMLLabelElement, React.HTMLAttributes<HTMLLabelElement>>(function Label(
  { className, children, ...props },
  forwardedRef,
) {
  return (
    <label
      ref={forwardedRef}
      {...props}
      className={cn(
        'text-base font-medium flex items-center text-gray-12 gap-x-1 opacity-[--cl-field-label-opacity,1]',
        className,
      )}
    >
      {children}
    </label>
  );
});

export const Input = React.forwardRef(function Input(
  {
    asChild,
    className,
    intent = 'idle',
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    asChild?: boolean;
    intent?: FieldIntent;
  },
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const Comp = asChild ? Slot : 'input';

  return (
    <Comp
      data-field-input=''
      ref={forwardedRef}
      className={cn(
        'flex w-full min-w-0 bg-white text-gray-12 rounded-md bg-clip-padding py-1.5 px-2.5 border border-gray-a6 outline-none text-base',
        'focus-visible:ring-[0.1875rem] disabled:opacity-50 disabled:cursor-not-allowed',
        // intent
        {
          idle: 'hover:border-gray-a8 focus-visible:ring-gray-a3 focus-visible:border-gray-a8',
          info: 'hover:border-gray-a8 focus-visible:ring-gray-a3 focus-visible:border-gray-a8',
          error: 'border-danger focus-visible:ring-danger/20',
          success: 'border-success focus-visible:ring-success/25', // (optically adjusted ring to 25 opacity)
          warning: 'border-warning focus-visible:ring-warning/20',
        }[intent],
        // data-[invalid] overrides all
        'data-[invalid]:border-danger data-[invalid]:hover:border-danger data-[invalid]:focus-visible:border-danger data-[invalid]:focus-visible:ring-danger/30',
        className,
      )}
      {...props}
    />
  );
});

export const Message = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    intent?: FieldIntent;
  }
>(function Message({ className, children, intent = 'idle', ...props }, forwardedRef) {
  return (
    <p
      ref={forwardedRef}
      {...props}
      className={cn(
        'text-base flex gap-x-1',
        {
          idle: 'text-gray-11',
          info: 'text-gray-11',
          error: 'text-danger',
          success: 'text-success',
          warning: 'text-warning',
        }[intent],
        className,
      )}
    >
      {intent !== 'idle' && (
        <span className='text-icon-sm mt-px'>
          {
            {
              error: <Icon.ExclamationOctagonSm />,
              info: <Icon.InformationLegacy />,
              success: <Icon.CheckmarkCircleSm />,
              warning: <Icon.ExclamationTriangleSm />,
            }[intent]
          }
        </span>
      )}
      {children}
    </p>
  );
});
