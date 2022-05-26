import React from 'react';

import { createVariants, StyleVariants } from '../styledSystem';
import { useFormControlContext } from './hooks';
import { Text } from './Text';

// TODO: Connect with CSS variables

const { applyVariants } = createVariants(theme => ({
  base: {
    color: theme.colors.$danger500,
    marginTop: theme.sizes.$2,
  },
  variants: {},
}));

type FormErrorTextProps = StyleVariants<typeof applyVariants> & {
  children: React.ReactNode;
};

const FormErrorText = (props: FormErrorTextProps) => {
  const { hasError, errorMessageId } = useFormControlContext();

  if (!hasError) {
    return null;
  }

  return (
    <Text
      css={applyVariants(props)}
      variant='error'
      aria-live='polite'
      id={errorMessageId}
    >
      {props.children}
    </Text>
  );
};

export { FormErrorText };
