import React from 'react';

import type { PrimitiveProps, RequiredProp, StyleVariants } from '../styledSystem';
import { common, createVariants, mqu } from '../styledSystem';
import { useFormField } from './hooks';
import { useInput } from './hooks/useInput';

const { applyVariants, filterProps } = createVariants((theme, props) => ({
  base: {
    boxSizing: 'inherit',
    margin: 0,
    padding: `${theme.space.$2x5} ${theme.space.$4}`,
    backgroundColor: theme.colors.$colorInputBackground,
    color: theme.colors.$colorInputText,
    // outline support for Windows contrast themes
    outline: 'transparent solid 2px',
    outlineOffset: '2px',
    width: props.type === 'checkbox' ? theme.sizes.$4 : '100%',
    aspectRatio: props.type === 'checkbox' ? '1/1' : 'unset',
    accentColor: theme.colors.$primary500,
    ...common.textVariants(theme).smallRegular,
    ...common.borderVariants(theme, props).normal,
    ...common.disabled(theme),
    [mqu.ios]: {
      fontSize: theme.fontSizes.$md,
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
  const fieldControlProps = useFormField() || {};
  const propsWithoutVariants = filterProps({
    ...props,
    hasError: props.hasError || fieldControlProps.hasError,
  });
  const { onChange } = useInput(propsWithoutVariants.onChange);
  const { isDisabled, hasError, focusRing, isRequired, ...rest } = propsWithoutVariants;
  const _disabled = isDisabled || fieldControlProps.isDisabled;
  const _required = isRequired || fieldControlProps.isRequired;
  const _hasError = hasError || fieldControlProps.hasError;

  return (
    <input
      {...rest}
      ref={ref}
      onChange={onChange}
      disabled={isDisabled}
      required={_required}
      id={props.id || fieldControlProps.id}
      aria-invalid={_hasError}
      aria-describedby={fieldControlProps.errorMessageId}
      aria-required={_required}
      aria-disabled={_disabled}
      css={applyVariants(propsWithoutVariants)}
    />
  );
});
