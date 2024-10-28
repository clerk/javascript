import { Slot } from '@radix-ui/react-slot';
import { cx } from 'cva';
import * as React from 'react';

import CheckmarkCircleSm from './icons/checkmark-circle-sm';
import ExclamationOctagonSm from './icons/exclamation-octagon-sm';
import ExclamationTriangleSm from './icons/exclamation-triangle-sm';
import InformationCircleSm from './icons/information-circle-sm';

type FieldIntent = 'error' | 'idle' | 'info' | 'success' | 'warning';

export const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function FieldRoot(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cx(
        '[--field-input-height:1.875rem]',
        '[--field-input-px:theme(spacing.3)]',
        'supports-ios:[--field-input-py:theme(spacing.1)] [--field-input-py:theme(spacing[1.5])]',
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
      ref={forwardedRef}
      {...props}
      className={cx('text-gray-9 text-sm font-medium', className)}
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

// Note:
// - To create the overlapping border/shadow effect"
//   - `ring` – "focus ring"
//   - `ring-offset` - border
export const Input = React.forwardRef(function FieldInput(
  {
    asChild,
    className,
    intent = 'idle',
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
      ref={forwardedRef}
      className={cx(
        'w-full justify-start',
        'py-[--field-input-py]',
        'ps-[--field-input-px]',
        // If an `InputGroup` exists, use the `pe` value, or fallback to the
        // standard input `px` value
        'pe-[var(--field-input-group-pe,var(--field-input-px))]',
        'text-gray-12 relative flex min-w-0 items-center rounded-md bg-white text-base outline-none ring ring-offset-1',
        'shadow-[0px_1px_1px_0px_theme(colors.gray.a3)]',
        'ring-offset-[--cl-field-input-border] focus-visible:ring focus-visible:ring-[--cl-field-input-ring,theme(ringColor.light)] focus-visible:ring-offset-[--cl-field-input-border-active] hover:enabled:ring-offset-[--cl-field-input-border-active] [&:not(:focus-visible)]:ring-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'supports-ios:text-[length:1rem] supports-ios:min-h-[1.875rem]',
        {
          idle: [
            '[--cl-field-input-border:theme(colors.gray.a4)]',
            '[--cl-field-input-border-active:theme(colors.gray.a7)]',
          ],
          info: [
            '[--cl-field-input-border:theme(colors.gray.a7)]',
            '[--cl-field-input-border-active:theme(colors.gray.a7)]',
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
              error: <ExclamationOctagonSm />,
              info: <InformationCircleSm />,
              success: <CheckmarkCircleSm />,
              warning: <ExclamationTriangleSm />,
            }[intent]
          }
        </span>
      )}
      {children}
    </p>
  );
});
