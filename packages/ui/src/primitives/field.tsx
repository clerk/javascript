import { Slot } from '@radix-ui/react-slot';
import { cx } from 'cva';
import * as React from 'react';

import * as Icon from './icon';

type FieldIntent = 'error' | 'idle' | 'info' | 'success' | 'warning';

export const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function FieldRoot(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      data-field-root=''
      ref={forwardedRef}
      {...props}
      className={cx(
        '[--field-input-border-width:1px]',
        '[--field-input-height:1.875rem]',
        '[--field-input-px:calc(theme(spacing.3)-var(--field-input-border-width))]',
        '[--field-input-py:calc(theme(spacing[1.5])-var(--field-input-border-width))]',
        '[--field-input-group-end-size:--field-input-height]',
        'has-[[data-field-checkbox]]:[--cl-field-label-cursor:pointer]',
        'has-[[data-field-input][disabled]]:[--cl-field-label-opacity:0.5]',
        'flex flex-col gap-2',
        className,
      )}
    >
      {children}
    </div>
  );
});

export const Label = React.forwardRef(function FieldLabel(
  {
    className,
    children,
    visuallyHidden,
    ...props
  }: React.HTMLAttributes<HTMLLabelElement> & { htmlFor?: string; visuallyHidden?: boolean },
  forwardedRef: React.ForwardedRef<HTMLLabelElement>,
) {
  return (
    <label
      data-field-label=''
      ref={forwardedRef}
      {...props}
      className={cx(
        visuallyHidden
          ? 'sr-only'
          : [
              'text-gray-12 flex items-center gap-x-1 text-base font-medium opacity-[--cl-field-label-opacity,1]',
              'cursor-[--cl-field-label-cursor,auto]',
            ],

        className,
      )}
    >
      {children}
    </label>
  );
});

export const LabelEnd = React.forwardRef(function FieldLabelEnd(
  { className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>,
  forwardedRef: React.ForwardedRef<HTMLSpanElement>,
) {
  return (
    <span
      data-field-label-end=''
      ref={forwardedRef}
      {...props}
      className={cx('flex-grow self-end text-end', className)}
    >
      {children}
    </span>
  );
});

export const Hint = React.forwardRef(function FieldHint(
  { className, children, ...props }: React.ComponentProps<typeof LabelEnd>,
  forwardedRef: React.ForwardedRef<React.ComponentRef<typeof LabelEnd>>,
) {
  return (
    <LabelEnd
      data-field-hint=''
      ref={forwardedRef}
      {...props}
      className={cx('text-gray-10 text-sm font-medium', className)}
    >
      {children}
    </LabelEnd>
  );
});

export const Checkbox = React.forwardRef(function FieldCheckbox(
  props: React.InputHTMLAttributes<HTMLInputElement>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <input
      data-field-checkbox=''
      ref={forwardedRef}
      type='checkbox'
      className={cx('accent-accent-9 mt-[0.1875em] size-3 cursor-pointer')}
      {...props}
    />
  );
});

export const InputGroup = React.forwardRef(function FieldInputGroup(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      data-field-input-group=''
      ref={ref}
      className={cx(
        'has-[[data-field-input-group-end]]:[--field-input-group-pe:--field-input-group-end-size]',
        'relative',
        className,
      )}
      {...props}
    />
  );
});

export const InputGroupEnd = React.forwardRef(function FieldInputGroupEnd(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      data-field-input-group-end=''
      ref={ref}
      className={cx('absolute inset-0 start-auto size-[--field-input-group-end-size]', className)}
      {...props}
    />
  );
});

export const Input = React.forwardRef(function FieldInput(
  {
    asChild,
    className,
    intent = 'idle',
    state = 'native',
    variant = 'default',
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    asChild?: boolean;
    intent?: FieldIntent;
    state?: 'native' | 'hover' | 'focus-visible';
    variant?: 'default' | 'otp-digit';
  },
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const Comp = asChild ? Slot : 'input';

  return (
    <Comp
      data-field-input=''
      ref={forwardedRef}
      className={cx(
        'py-[--field-input-py]',
        'ps-[--field-input-px]',
        // If an `InputGroup` exists, use the `pe` value, or fallback to the
        // standard input `px` value
        'pe-[var(--field-input-group-pe,var(--field-input-px))]',
        'border-[length:--field-input-border-width] bg-clip-padding',
        'text-gray-12 relative flex min-w-0 rounded-md bg-white text-base outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // variant
        {
          default: 'w-full justify-start',
          'otp-digit': 'aspect-square size-10 justify-center text-[calc(var(--cl-font-size)*1.4)] font-semibold',
        }[variant],
        // state
        {
          native:
            'border-[--cl-field-input-border] focus-visible:border-[--cl-field-input-border-active] focus-visible:ring-[0.1875rem] focus-visible:ring-[--cl-field-input-ring] hover:enabled:border-[--cl-field-input-border-active]',
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
>(function FieldMessage({ className, children, justify = 'start', intent = 'idle', ...props }, forwardedRef) {
  return (
    <p
      data-field-message=''
      ref={forwardedRef}
      {...props}
      className={cx(
        'flex gap-x-1 text-base',
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
