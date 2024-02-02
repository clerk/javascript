import React from 'react';

import type { PrimitiveProps, RequiredProp, StyleVariants } from '../styledSystem';
import { common, createVariants, mqu } from '../styledSystem';
import { sanitizeInputProps, useFormField } from './hooks';
import { useInput } from './hooks/useInput';

const { applyVariants, filterProps } = createVariants((theme, props) => ({
  base: {
    boxSizing: 'inherit',
    margin: 0,
    padding: `${theme.space.$1x5} ${theme.space.$3}`,
    backgroundColor: theme.colors.$colorInputBackground,
    color: theme.colors.$colorInputText,
    // outline support for Windows contrast themes
    outline: 'transparent solid 2px',
    outlineOffset: '2px',
    maxHeight: theme.sizes.$9,
    width: props.type === 'checkbox' ? theme.sizes.$4 : '100%',
    aspectRatio: props.type === 'checkbox' ? '1/1' : 'unset',
    accentColor: theme.colors.$primary500,
    ...common.textVariants(theme).body,
    ...common.borderVariants(theme, props).normal,
    ...common.disabled(theme),
    [mqu.ios]: {
      fontSize: theme.fontSizes.$lg,
    },
    ':autofill': {
      animationName: 'onAutoFillStart',
    },
  },
  variants: {},
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
  const { errorMessageId, ...fieldControlProps } = sanitizeInputProps(fieldControl, ['errorMessageId']);
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
   */

  const typeProps =
    type === 'email'
      ? {
          pattern: '^.*@[a-zA-Z0-9\\-]+\\.[a-zA-Z0-9\\-\\.]+$',
        }
      : { type };

  return (
    <input
      {...rest}
      {...typeProps}
      ref={ref}
      onChange={onChange}
      disabled={isDisabled}
      required={_required}
      id={props.id || fieldControlProps.id}
      aria-invalid={_hasError}
      aria-describedby={errorMessageId}
      aria-required={_required}
      aria-disabled={_disabled}
      css={applyVariants(propsWithoutVariants)}
    />
  );
});
