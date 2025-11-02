import React from 'react';

import type { PrimitiveProps, RequiredProp, StateProps, StyleVariants } from '../styledSystem';
import { common, createVariants } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';
import { useFormField } from './hooks/useFormField';

const { applyVariants } = createVariants(theme => ({
  base: {
    color: theme.colors.$colorForeground,
    ...common.textVariants(theme).subtitle,
    ...common.disabled(theme),
  },
  variants: {},
}));

type OwnProps = React.PropsWithChildren<StateProps>;

type FormLabelProps = PrimitiveProps<'label'> & StyleVariants<typeof applyVariants> & OwnProps & RequiredProp;

export const FormLabel = (props: FormLabelProps) => {
  const { id: fieldHtmlId } = useFormField();
  const { isRequired, htmlFor: htmlForProp, ...rest } = props;
  return (
    <label
      {...applyDataStateProps(rest)}
      htmlFor={htmlForProp ?? fieldHtmlId}
      css={applyVariants(props)}
    >
      {props.children}
    </label>
  );
};
