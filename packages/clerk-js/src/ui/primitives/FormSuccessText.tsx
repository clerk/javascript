import React from 'react';

import type { StyleVariants } from '../styledSystem';
import { animations, createVariants } from '../styledSystem';
import { useFormControl } from './hooks';
import type { TextProps } from './Text';
import { Text } from './Text';

const { applyVariants } = createVariants(theme => ({
  base: {
    willChange: 'transform, opacity, height',
    marginTop: theme.sizes.$2,
    animation: `${animations.textInSmall} ${theme.transitionDuration.$fast}`,
  },
  variants: {},
}));

type FormSuccessTextProps = React.PropsWithChildren<StyleVariants<typeof applyVariants> & TextProps>;

export const FormSuccessText = (props: FormSuccessTextProps) => {
  const { hasError, errorMessageId } = useFormControl() || {};

  if (!hasError && !props.children) {
    return null;
  }

  return (
    // @ts-expect-error
    <Text
      variant='smallRegular'
      colorScheme='success'
      aria-live='polite'
      id={errorMessageId}
      {...props}
      css={applyVariants(props)}
    />
  );
};
