import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { useFormControlContext } from './hooks';
import { useInput } from './hooks/useInput';

// TODO: Connect with CSS variables

const { applyVariants, filterProps } = createVariants((theme, props) => ({
  base: {
    margin: 0,
    outline: 0,
    padding: `${theme.sizes.$2x5} ${theme.sizes.$4}`,
    fontStyle: 'normal',
    fontWeight: theme.fontWeights.$normal,
    border: '1px solid',
    borderColor: props.hasError ? theme.colors.$danger500 : theme.colors.$blackAlpha300,
    borderRadius: theme.radii.$md,
    '&:focus-visible': {
      borderColor: props.hasError ? theme.colors.$danger500 : theme.colors.$primary50,
      boxShadow: 'none',
    },
  },
  variants: {},
}));

type InputProps = PrimitiveProps<'input'> &
  StyleVariants<typeof applyVariants> & {
    isDisabled?: boolean;
    hasError?: boolean;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const controlInputProps = useFormControlContext();
  const propsWithoutVariants = filterProps({ ...props, hasError: props.hasError || controlInputProps.hasError });
  const { onChange } = useInput(propsWithoutVariants.onChange);
  const { isDisabled, hasError, ...rest } = propsWithoutVariants;
  return (
    <input
      {...rest}
      ref={ref}
      onChange={onChange}
      disabled={isDisabled}
      id={props.id || controlInputProps.id}
      aria-invalid={hasError || controlInputProps.hasError}
      aria-describedby={controlInputProps.errorMessageId}
      aria-required={controlInputProps.isRequired}
      css={applyVariants(propsWithoutVariants)}
    />
  );
});

export { Input };
