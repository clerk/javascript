import { cx } from 'cva';
import * as React from 'react';

import { mergeDescriptors, type ParsedElementsFragment, useAppearance } from '~/contexts/AppearanceContext';
import { applyDescriptors, dva, type VariantProps } from '~/utils/dva';

import CheckmarkCircleSm from './icons/checkmark-circle-sm';
import ExclamationOctagonSm from './icons/exclamation-octagon-sm';
import ExclamationTriangleSm from './icons/exclamation-triangle-sm';
import InformationCircleSm from './icons/information-circle-sm';

////////////////////////////////////////////////////////////////////////////////

/**
 * FieldRoot
 */

const fieldRootLayoutStyle = {
  fieldRoot: {
    className: [
      '[--field-input-height:1.875rem]',
      '[--field-input-px:theme(spacing.3)]',
      'supports-ios:[--field-input-py:theme(spacing.1)] [--field-input-py:theme(spacing[1.5])]',
      '[--field-input-group-end-size:--field-input-height]',
      'flex flex-col gap-2',
    ].join(' '),
  },
};

const fieldRootVisualStyle = {
  fieldRoot: {
    className: [
      'has-[[data-field-checkbox]]:[--cl-field-label-cursor:pointer]',
      'has-[[data-field-input][disabled]]:[--cl-field-label-opacity:0.5]',
    ].join(' '),
  },
};

export const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function FieldRoot(
  { children, className, ...props },
  forwardedRef,
) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <div
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(elements.fieldRoot)}
    >
      {children}
    </div>
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * FieldLabel
 */

const fieldLabelLayoutStyle = {
  fieldLabel: {
    className: 'flex items-center gap-x-1',
  },
};

const fieldLabelVisualStyle = {
  fieldLabel: {
    className:
      'text-gray-12  text-base font-medium opacity-[--cl-field-label-opacity,1] cursor-[--cl-field-label-cursor,auto]',
  },
};

export const Label = React.forwardRef(function FieldLabel(
  {
    className,
    children,
    visuallyHidden,
    ...props
  }: React.HTMLAttributes<HTMLLabelElement> & { htmlFor?: string; visuallyHidden?: boolean },
  forwardedRef: React.ForwardedRef<HTMLLabelElement>,
) {
  const { elements } = useAppearance().parsedAppearance;
  const fieldLabelDescriptors = applyDescriptors(elements, 'fieldLabel');
  return (
    <label
      ref={forwardedRef}
      {...props}
      className={cx(visuallyHidden ? 'sr-only' : fieldLabelDescriptors.className)}
    >
      {children}
    </label>
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * FieldLabelEnd
 */

const fieldLabelEndLayoutStyle = {
  fieldLabelEnd: {
    className: 'flex-grow self-end text-end',
  },
};

export const LabelEnd = React.forwardRef(function FieldLabelEnd(
  { className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>,
  forwardedRef: React.ForwardedRef<HTMLSpanElement>,
) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <span
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(elements.fieldLabelEnd)}
    >
      {children}
    </span>
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * FieldHint
 */

const fieldHintVisualStyle = {
  fieldLabelEnd: {
    className: 'text-gray-9 text-sm font-medium',
  },
};

export const Hint = React.forwardRef(function FieldHint(
  { className, children, ...props }: React.ComponentProps<typeof LabelEnd>,
  forwardedRef: React.ForwardedRef<React.ComponentRef<typeof LabelEnd>>,
) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <LabelEnd
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(elements.fieldHint)}
    >
      {children}
    </LabelEnd>
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * FieldCheckbox
 */

const fieldCheckboxLayoutStyle = {
  fieldCheckbox: {
    className: 'mt-[0.1875em] size-3',
  },
};

const fieldCheckboxVisualStyle = {
  fieldCheckbox: {
    className: 'accent-accent-9 cursor-pointer',
  },
};

export const Checkbox = React.forwardRef(function FieldCheckbox(
  props: React.InputHTMLAttributes<HTMLInputElement>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <input
      ref={forwardedRef}
      type='checkbox'
      {...props}
      {...mergeDescriptors(elements.fieldCheckbox)}
    />
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * FieldInputGroup
 */

const fieldInputGroupLayoutStyle = {
  fieldInputGroup: {
    className: 'relative has-[[data-field-input-group-end]]:[--field-input-group-pe:--field-input-group-end-size]',
  },
};

export const InputGroup = React.forwardRef(function FieldInputGroup(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <div
      ref={ref}
      {...props}
      {...mergeDescriptors(elements.fieldInputGroup)}
    />
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * FieldInputGroupEnd
 */

const fieldInputGroupEndLayoutStyle = {
  fieldInputGroupEnd: {
    className: 'absolute inset-0 start-auto size-[--field-input-group-end-size]',
  },
};

export const InputGroupEnd = React.forwardRef(function FieldInputGroupEnd(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <div
      data-field-input-group-end=''
      ref={ref}
      // className={cx('absolute inset-0 start-auto size-[--field-input-group-end-size]', className)}
      {...props}
      {...mergeDescriptors(elements.fieldInputGroupEnd)}
    />
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * FieldInput
 */

const fieldInputLayoutStyle = {
  fieldInput: {
    className: [
      'w-full',
      'py-[--field-input-py]',
      'ps-[--field-input-px]',
      // If an `InputGroup` exists, use the `pe` value, or fallback to the
      // standard input `px` value
      'pe-[var(--field-input-group-pe,var(--field-input-px))]',
      'relative flex min-w-0 items-center',
      'supports-ios:text-[length:1rem] supports-ios:min-h-[1.875rem]',
    ].join(' '),
  },
};

const fieldInputVisualStyle = {
  fieldInput: {
    className: [
      'text-gray-12 rounded-md bg-white text-base outline-none ring ring-offset-1',
      'shadow-[0px_1px_1px_0px_theme(colors.gray.a3)]',
      'ring-offset-[--cl-field-input-border] focus-visible:ring focus-visible:ring-[--cl-field-input-ring,theme(ringColor.light)] focus-visible:ring-offset-[--cl-field-input-border-active] hover:enabled:ring-offset-[--cl-field-input-border-active] [&:not(:focus-visible)]:ring-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ].join(' '),
  },
  fieldInputIdle: {
    className: [
      '[--cl-field-input-border:theme(colors.gray.a4)]',
      '[--cl-field-input-border-active:theme(colors.gray.a7)]',
    ].join(' '),
  },
  fieldInputInfo: {
    className: [
      '[--cl-field-input-border:theme(colors.gray.a7)]',
      '[--cl-field-input-border-active:theme(colors.gray.a7)]',
    ].join(' '),
  },
  fieldInputError: {
    className: [
      '[--cl-field-input-border:theme(colors.danger.DEFAULT)]',
      '[--cl-field-input-border-active:theme(colors.danger.DEFAULT)]',
      '[--cl-field-input-ring:theme(colors.danger.DEFAULT/0.2)]',
    ].join(' '),
  },
  fieldInputSuccess: {
    className: [
      '[--cl-field-input-border:theme(colors.success.DEFAULT)]',
      '[--cl-field-input-border-active:theme(colors.success.DEFAULT)]',
      '[--cl-field-input-ring:theme(colors.success.DEFAULT/0.25)]',
    ].join(' '),
  },
  fieldInputWarning: {
    className: [
      '[--cl-field-input-border:theme(colors.warning.DEFAULT)]',
      '[--cl-field-input-border-active:theme(colors.warning.DEFAULT)]',
      '[--cl-field-input-ring:theme(colors.warning.DEFAULT/0.2)]',
    ].join(' '),
  },
};

const input = dva({
  base: 'fieldInput',
  variants: {
    intent: {
      idle: 'fieldInputIdle',
      info: 'fieldInputInfo',
      error: 'fieldInputError',
      success: 'fieldInputSuccess',
      warning: 'fieldInputWarning',
    },
  },
});

// Note:
// - To create the overlapping border/shadow effect"
//   - `ring` – "focus ring"
//   - `ring-offset` - border
export const Input = React.forwardRef(function FieldInput(
  { descriptor, intent = 'idle', ...props }: VariantProps<typeof input> & React.InputHTMLAttributes<HTMLInputElement>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const { elements } = useAppearance().parsedAppearance;

  return (
    <input
      ref={forwardedRef}
      {...props}
      {...applyDescriptors(elements, input({ intent, descriptor }))}
    />
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * FieldMessage
 */

const fieldMessageLayoutStyle = {
  fieldMessage: {
    className: 'flex gap-x-1',
  },
  fieldMessageStart: {
    className: 'justify-start',
  },
  fieldMessageCenter: {
    className: 'justify-center',
  },
  fieldMessageEnd: {
    className: 'justify-end',
  },
};

const fieldMessageVisualStyle = {
  fieldMessage: {
    className: 'text-base',
  },
  fieldMessageIdle: {
    className: 'text-gray-11',
  },
  fieldMessageInfo: {
    className: 'text-gray-11',
  },
  fieldMessageError: {
    className: 'text-danger',
  },
  fieldMessageSuccess: {
    className: 'text-success',
  },
  fieldMessageWarning: {
    className: 'text-warning',
  },
};

const message = dva({
  base: 'fieldMessage',
  variants: {
    justify: {
      start: 'fieldMessageStart',
      center: 'fieldMessageCenter',
      end: 'fieldMessageEnd',
    },
    intent: {
      idle: 'fieldMessageIdle',
      info: 'fieldMessageInfo',
      error: 'fieldMessageError',
      success: 'fieldMessageSuccess',
      warning: 'fieldMessageWarning',
    },
  },
});

export const Message = React.forwardRef<
  HTMLDivElement,
  VariantProps<typeof message> & React.HTMLAttributes<HTMLDivElement>
>(function FieldMessage({ descriptor, children, justify = 'start', intent = 'idle', ...props }, forwardedRef) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <p
      ref={forwardedRef}
      {...props}
      {...applyDescriptors(elements, message({ justify, intent, descriptor }))}
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

export const layoutStyle = {
  ...fieldRootLayoutStyle,
  ...fieldLabelLayoutStyle,
  ...fieldLabelEndLayoutStyle,
  // ...fieldHintLayoutStyle,
  ...fieldCheckboxLayoutStyle,
  ...fieldInputGroupLayoutStyle,
  ...fieldInputGroupEndLayoutStyle,
  ...fieldInputLayoutStyle,
  ...fieldMessageLayoutStyle,
} satisfies ParsedElementsFragment;

export const visualStyle = {
  ...fieldRootVisualStyle,
  ...fieldLabelVisualStyle,
  // ...fieldLabelEndLayoutStyle,
  ...fieldHintVisualStyle,
  ...fieldCheckboxVisualStyle,
  // ...fieldInputGroupVisualStyle,
  // ...fieldInputGroupEndVisualStyle,
  ...fieldInputVisualStyle,
  ...fieldMessageVisualStyle,
} satisfies ParsedElementsFragment;
