import React from 'react';

import type { PrimitiveProps, RequiredProp, StyleVariants } from '../styledSystem';
import { common, createVariants, mqu } from '../styledSystem';
import { sanitizeInputProps, useFormField } from './hooks/useFormField';
import { useInput } from './hooks/useInput';

const { applyVariants, filterProps } = createVariants((theme, props) => ({
  base: {
    boxSizing: 'border-box',
    margin: 0,
    padding: `${theme.space.$1x5} ${theme.space.$3}`,
    backgroundColor: theme.colors.$colorInput,
    color: theme.colors.$colorInputForeground,
    // outline support for Windows contrast themes
    outline: 'transparent solid 2px',
    outlineOffset: '2px',
    maxHeight: theme.sizes.$9,
    width: props.type === 'checkbox' ? theme.sizes.$4 : '100%',
    aspectRatio: props.type === 'checkbox' ? '1/1' : 'unset',
    accentColor: theme.colors.$primary500,
    ...common.textVariants(theme).body,
    ...common.disabled(theme),
    // This is a workaround to prevent zooming on iOS when focusing an input
    [mqu.ios]: {
      fontSize: theme.fontSizes.$lg,
      '&:not([type="checkbox"]):not([type="radio"])': {
        WebkitAppearance: 'none',
      },
    },
    ':autofill': {
      animationName: 'onAutoFillStart',
    },
    '::placeholder': {
      color: theme.colors.$colorMutedForeground,
    },
  },
  variants: {
    variant: {
      default: {
        ...common.borderVariants(theme, props).normal,
      },
      unstyled: {
        borderWidth: 0,
        boxShadow: 'unset',
        backgroundColor: 'transparent',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
}));

type OwnProps = {
  isDisabled?: boolean;
  hasError?: boolean;
  focusRing?: boolean;
  isSuccessful?: boolean;
};

export type InputProps = PrimitiveProps<'input'> & StyleVariants<typeof applyVariants> & OwnProps & RequiredProp;

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const fieldControl = useFormField() || {};
  // @ts-expect-error Typescript is complaining that `errorMessageId` does not exist. We are clearly passing them from above.
  const { errorMessageId, ignorePasswordManager, feedbackType, ...fieldControlProps } = sanitizeInputProps(
    fieldControl,
    ['errorMessageId', 'ignorePasswordManager', 'feedbackType'],
  );

  const propsWithoutVariants = filterProps({
    ...props,
    hasError: props.hasError || fieldControlProps.hasError,
  });
  const { onChange } = useInput(propsWithoutVariants.onChange);
  const { isDisabled, hasError, focusRing, isRequired, type, ...rest } = propsWithoutVariants;
  const _disabled = isDisabled || fieldControlProps.isDisabled;
  const _required = isRequired || fieldControlProps.isRequired;
  const _hasError = hasError || fieldControlProps.hasError;

  /**
   * type="email" will not allow characters like this one "ö", instead remove type email and provide a pattern that accepts any character before the "@" symbol
   * inputMode="email" ensures the email keyboard appears on mobile devices
   */

  const typeProps =
    type === 'email'
      ? { type: 'text' as const, pattern: '^.*@[a-zA-Z0-9\\-]+\\.[a-zA-Z0-9\\-\\.]+$', inputMode: 'email' as const }
      : { type: type || ('text' as const) };

  const passwordManagerProps = ignorePasswordManager
    ? {
        'data-1p-ignore': true,
      }
    : undefined;

  return (
    <input
      {...rest}
      {...typeProps}
      {...passwordManagerProps}
      ref={ref}
      onChange={onChange}
      disabled={isDisabled}
      required={_required}
      id={props.id || fieldControlProps.id}
      aria-invalid={_hasError}
      aria-describedby={errorMessageId ? errorMessageId : undefined}
      aria-required={_required}
      aria-disabled={_disabled}
      data-feedback={feedbackType}
      data-variant={props.variant || 'default'}
      css={applyVariants(props)}
    />
  );
});

export const CheckboxInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <Input
      {...props}
      type='checkbox'
      ref={ref}
    />
  );
});

export const RadioInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <Input
      {...props}
      type='radio'
      ref={ref}
    />
  );
});

export type TextareaProps = PrimitiveProps<'textarea'> & StyleVariants<typeof applyVariants> & OwnProps & RequiredProp;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const { isDisabled, hasError, focusRing, isRequired, ...rest } = props;
  const _disabled = isDisabled || props.isDisabled;
  const _required = isRequired || props.isRequired;
  const _hasError = hasError || props.hasError;

  return (
    <textarea
      {...rest}
      ref={ref}
      disabled={_disabled}
      required={_required}
      aria-invalid={_hasError}
      aria-required={_required}
      css={applyVariants(props)}
    />
  );
});
