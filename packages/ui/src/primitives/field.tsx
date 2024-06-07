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

export const Label = React.forwardRef(function Label(
  {
    className,
    children,
    visuallyHidden,
    ...props
  }: React.HTMLAttributes<HTMLLabelElement> & { visuallyHidden?: boolean },
  forwardedRef: React.ForwardedRef<HTMLLabelElement>,
) {
  return (
    <label
      ref={forwardedRef}
      {...props}
      className={cn(
        visuallyHidden
          ? 'sr-only'
          : 'text-base font-medium flex items-center text-gray-12 gap-x-1 opacity-[--cl-field-label-opacity,1]',
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
    state = 'native',
    ...props
  }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    asChild?: boolean;
    intent?: FieldIntent;
    type?: React.InputHTMLAttributes<HTMLInputElement>['type'] | 'otp';
    state?: 'native' | 'hover' | 'focus-visible';
  },
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const Comp = asChild ? Slot : 'input';

  return (
    <Comp
      data-field-input=''
      ref={forwardedRef}
      className={cn(
        'flex w-full min-w-0 bg-white text-gray-12 rounded-md bg-clip-padding py-1.5 px-2.5 border outline-none text-base',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // type-specific overrides
        props.type === 'otp'
          ? 'min-h-10 text-[calc(var(--cl-font-size)*1.4)] font-semibold justify-center'
          : 'min-h-8 justify-start',
        // state
        {
          native:
            'border-[--cl-field-input-border] hover:border-[--cl-field-input-border-active] focus-visible:border-[--cl-field-input-border-active] focus-visible:ring-[0.1875rem] focus-visible:ring-[--cl-field-input-ring]',
          hover: 'border-[--cl-field-input-border-active]',
          'focus-visible': 'border-[--cl-field-input-border-active] ring-[0.1875rem] ring-[--cl-field-input-ring]',
        }[state],
        // intent
        {
          idle: [
            '[--cl-field-input-border:theme(colors.gray.a6)]',
            '[--cl-field-input-border-active:theme(colors.gray.a8)]',
            '[--cl-field-input-ring:theme(colors.gray.a3)]',
          ],
          info: [
            '[--cl-field-input-border:theme(colors.gray.a8)]',
            '[--cl-field-input-border-active:theme(colors.gray.a8)]',
            '[--cl-field-input-ring:theme(colors.gray.a3)]',
          ],
          error: [
            '[--cl-field-input-border:theme(colors.danger.DEFAULT)]',
            '[--cl-field-input-border-active:theme(colors.danger.DEFAULT)]',
            '[--cl-field-input-ring:theme(colors.danger.DEFAULT/0.2)]',
          ],
          success: [
            '[--cl-field-input-border:theme(colors.success.DEFAULT)]',
            '[--cl-field-input-border-active:theme(colors.success.DEFAULT)]',
            '[--cl-field-input-ring:theme(colors.success.DEFAULT/0.25)]', // (optically adjusted ring to 25 opacity)
          ],
          warning: [
            '[--cl-field-input-border:theme(colors.warning.DEFAULT)]',
            '[--cl-field-input-border-active:theme(colors.warning.DEFAULT)]',
            '[--cl-field-input-ring:theme(colors.warning.DEFAULT/0.2)]',
          ],
        }[intent],
        // data-[invalid] overrides any currently-defined `intent`
        [
          'data-[invalid]:[--cl-field-input-border:theme(colors.danger.DEFAULT)]',
          'data-[invalid]:[--cl-field-input-border-active:theme(colors.danger.DEFAULT)]',
          'data-[invalid]:[--cl-field-input-ring:theme(colors.danger.DEFAULT/0.2)]',
        ],
        className,
      )}
      {...props}
    />
  );
});

export const Message = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    justify?: 'start' | 'center' | 'end';
    children?: React.ReactNode;
    intent?: FieldIntent;
  }
>(function Message({ className, children, justify = 'start', intent = 'idle', ...props }, forwardedRef) {
  return (
    <p
      ref={forwardedRef}
      {...props}
      className={cn(
        'text-base flex gap-x-1',
        {
          start: 'justify-start',
          center: 'justify-center',
          end: 'justify-end',
        }[justify],
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
