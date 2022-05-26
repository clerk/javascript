import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { useFormControlContext } from './hooks';

// TODO: Connect with CSS variables

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    color: theme.colors.$black,
    fontStyle: theme.fontStyles.$normal,
    fontWeight: theme.fontWeights.$medium,
    lineHeight: theme.lineHeights.$none,
    marginBottom: theme.sizes.$1,
  },
  variants: {},
}));

type FormLabelProps = PrimitiveProps<'label'> &
  StyleVariants<typeof applyVariants> & {
    hasError?: boolean;
    children: React.ReactNode;
  };

const FormLabel = (props: FormLabelProps) => {
  const propsWithoutVariants = filterProps(props);
  const { id } = useFormControlContext();

  return (
    <label
      {...propsWithoutVariants}
      htmlFor={id}
      css={applyVariants(props)}
    >
      {props.children}
    </label>
  );
};

export { FormLabel };
