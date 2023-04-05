import React from 'react';

import type { PrimitiveProps, RequiredProp, StyleVariants } from '../styledSystem';
import { common, createVariants, mqu } from '../styledSystem';
import { useFormControl } from './hooks';
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
    ...(props.focusRing === false ? {} : common.focusRingInput(theme)),
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

// @ts-ignore
export type InputProps = PrimitiveProps<'input'> & StyleVariants<typeof applyVariants> & OwnProps & RequiredProp;

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const formControlProps = useFormControl() || {};
  const propsWithoutVariants = filterProps({
    ...props,
    hasError: props.hasError || formControlProps.hasError,
    isSuccessful: props.isSuccessful || formControlProps.isSuccessful,
  });
  const { onChange } = useInput(propsWithoutVariants.onChange);
  const { isDisabled, hasError, focusRing, isRequired, isSuccessful, ...rest } = propsWithoutVariants;

  return (
    <input
      {...rest}
      ref={ref}
      onChange={onChange}
      disabled={isDisabled}
      required={isRequired || formControlProps.isRequired}
      id={props.id || formControlProps.id}
      aria-invalid={hasError || formControlProps.hasError}
      aria-describedby={formControlProps.errorMessageId}
      aria-required={formControlProps.isRequired}
      css={applyVariants(propsWithoutVariants)}
    />
  );
});
