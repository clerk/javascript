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
    className,
    intent = 'idle',
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    intent?: FieldIntent;
  },
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <input
      data-field-input=''
      ref={forwardedRef}
      className={cn(
        'block w-full bg-white text-gray-12 rounded-md bg-clip-padding py-1.5 px-2.5 border border-gray-a6 outline-none text-base',
        'focus-visible:ring-[0.1875rem] disabled:opacity-50 disabled:cursor-not-allowed',
        // idle
        (intent === 'idle' || intent === 'info') &&
          'hover:border-gray-a8 focus-visible:ring-gray-a3 focus-visible:border-gray-a8',
        // invalid
        "data-[invalid='true']:border-danger data-[invalid='true']:focus-visible:ring-danger/30",
        // error
        intent === 'error' && 'border-danger focus-visible:ring-danger/20',
        // success (optically adjusted ring to 25 opacity)
        intent === 'success' && 'border-success focus-visible:ring-success/25',
        // warning
        intent === 'warning' && 'border-warning focus-visible:ring-warning/20',
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
        // note: we can't use an object here to get the relevant intent as our
        // tailwind-transformer doesn't support it
        intent === 'idle' && 'text-gray-11',
        intent === 'info' && 'text-gray-11',
        intent === 'error' && 'text-danger',
        intent === 'success' && 'text-success',
        intent === 'warning' && 'text-warning',
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
