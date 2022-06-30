import React from 'react';

import { animations, createVariants, StyleVariants } from '../styledSystem';
import { useFormControl } from './hooks';
import { Text } from './Text';

const { applyVariants } = createVariants(theme => ({
  base: {
    willChange: 'transform, opacity, height',
    marginTop: theme.sizes.$2,
    animation: `${animations.textInSmall} ${theme.transitionDuration.$fast}`,
  },
  variants: {},
}));

type FormErrorTextProps = React.PropsWithChildren<StyleVariants<typeof applyVariants>>;

export const FormErrorText = (props: FormErrorTextProps) => {
  const { hasError, errorMessageId } = useFormControl() || {};

  if (!hasError && !props.children) {
    return null;
  }

  return (
    <Text
      variant='smallRegular'
      colorScheme='danger'
      aria-live='polite'
      id={errorMessageId}
      {...props}
      css={applyVariants(props)}
    />
  );
};
