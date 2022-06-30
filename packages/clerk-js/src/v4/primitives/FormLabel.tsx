import React from 'react';

import { common, createVariants, PrimitiveProps, StateProps, StyleVariants } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';
import { useFormControl } from './hooks';

const { applyVariants } = createVariants(theme => ({
  base: {
    color: theme.colors.$colorText,
    ...common.textVariants(theme).smallMedium,
    ...common.disabled(theme),
  },
  variants: {},
}));

type OwnProps = React.PropsWithChildren<StateProps>;

type FormLabelProps = PrimitiveProps<'label'> & StyleVariants<typeof applyVariants> & OwnProps;

export const FormLabel = (props: FormLabelProps) => {
  const { id } = useFormControl();
  return (
    <label
      {...applyDataStateProps(props)}
      htmlFor={id}
      css={applyVariants(props)}
    >
      {props.children}
    </label>
  );
};
