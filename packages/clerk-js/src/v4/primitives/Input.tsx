import React from 'react';

import { common, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { useFormControl } from './hooks';
import { useInput } from './hooks/useInput';

const { applyVariants, filterProps } = createVariants((theme, props) => ({
  base: {
    margin: 0,
    outline: 0,
    padding: `${theme.sizes.$2x5} ${theme.sizes.$4}`,
    backgroundColor: theme.colors.$colorInputBackground,
    color: theme.colors.$colorInputText,
    width: '100%',
    ...common.textVariants(theme).input,
    ...common.borderVariants(theme, props).normal,
    ...(props.focusRing === false ? {} : common.focusRingInput(theme)),
    ...common.disabled(theme),
  },
  variants: {},
}));

type OwnProps = {
  isDisabled?: boolean;
  hasError?: boolean;
  focusRing?: boolean;
};

export type InputProps = PrimitiveProps<'input'> & StyleVariants<typeof applyVariants> & OwnProps;

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const formControlProps = useFormControl() || {};
  const propsWithoutVariants = filterProps({ ...props, hasError: props.hasError || formControlProps.hasError });
  const { onChange } = useInput(propsWithoutVariants.onChange);
  const { isDisabled, hasError, focusRing, ...rest } = propsWithoutVariants;
  return (
    <input
      {...rest}
      ref={ref}
      onChange={onChange}
      disabled={isDisabled}
      id={props.id || formControlProps.id}
      aria-invalid={hasError || formControlProps.hasError}
      aria-describedby={formControlProps.errorMessageId}
      aria-required={formControlProps.isRequired}
      css={applyVariants(propsWithoutVariants)}
    />
  );
});
