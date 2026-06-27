import React from 'react';

import { localizationKeys, useLocalizations } from '../localization';
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
    accentColor: theme.colors.$primary500,
    ...(props.type === 'checkbox'
      ? {
          appearance: 'none',
          height: theme.sizes.$4,
          padding: theme.space.$1,
          backgroundSize: `${theme.sizes.$2} ${theme.sizes.$2}`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&:checked': {
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 8 8'%3E%3Cpath fill='${theme.colors.$white}' fill-rule='evenodd' d='M7.712.233a.889.889 0 0 1 .055 1.256C6.742 2.61 6.249 3.291 5.508 4.615c-.279.5-.589 1.194-.835 1.784a36.761 36.761 0 0 0-.382.95l-.021.057-.006.014-.001.003a.89.89 0 0 1-1.504.27L.218 4.765A.889.889 0 1 1 1.56 3.6l1.591 1.834c.235-.548.524-1.181.806-1.685.807-1.445 1.38-2.239 2.499-3.46A.889.889 0 0 1 7.712.234Z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundColor: theme.colors.$primary500,
          },
        }
      : {}),
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
        ...(props.type === 'checkbox' ? { borderRadius: theme.radii.$sm } : {}),
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
  const { t } = useLocalizations();
  // @ts-expect-error Typescript is complaining that `feedbackMessageId` does not exist. We are clearly passing them from above.
  const { feedbackMessageId, ignorePasswordManager, feedbackType, ...fieldControlProps } = sanitizeInputProps(
    fieldControl,
    ['feedbackMessageId', 'ignorePasswordManager', 'feedbackType'],
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
      ? {
          type: 'text' as const,
          pattern: '^.*@[a-zA-Z0-9\\-]+\\.[a-zA-Z0-9\\-\\.]+$',
          inputMode: 'email' as const,
          title: t(localizationKeys('formFieldInput__emailAddress_format')),
        }
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
      aria-describedby={feedbackMessageId || undefined}
      aria-required={_required}
      aria-disabled={_disabled}
      data-feedback={feedbackType}
      data-variant={props.variant || 'default'}
      css={applyVariants(props)}
    />
  );
});

/**
 * This is to allow for the creation of "fake" input elements that are not actually inputs.
 * This is used to create the OTPInputSegment component.
 */
export type DivInputProps = PrimitiveProps<'div'> & StyleVariants<typeof applyVariants> & OwnProps & RequiredProp;

export const DivInput = React.forwardRef<HTMLDivElement, DivInputProps>((props, ref) => {
  const fieldControl = useFormField() || {};
  // @ts-expect-error Typescript is complaining that `errorMessageId` does not exist. We are clearly passing them from above.
  const { feedbackType } = sanitizeInputProps(fieldControl, ['feedbackType', 'data-active']);

  const propsWithoutVariants = filterProps({
    ...props,
    hasError: props.hasError,
  });
  const { isDisabled, hasError, focusRing, isRequired, ...rest } = propsWithoutVariants;

  return (
    <div
      {...rest}
      ref={ref}
      id={props.id}
      aria-invalid={hasError}
      data-feedback={feedbackType}
      data-variant={props.variant || 'default'}
      data-focus-within={focusRing}
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
