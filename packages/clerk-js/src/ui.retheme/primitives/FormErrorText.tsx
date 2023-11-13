import React, { forwardRef } from 'react';

import { Icon } from '../customizables';
import { ExclamationCircle } from '../icons';
import type { StyleVariants } from '../styledSystem';
import { animations, createVariants } from '../styledSystem';
import { useFormControl } from './hooks';
import { Text } from './Text';

const { applyVariants } = createVariants(theme => ({
  base: {
    willChange: 'transform, opacity, height',
    marginTop: theme.sizes.$2,
    animation: `${animations.textInSmall} ${theme.transitionDuration.$fast}`,
    display: 'flex',
    gap: theme.sizes.$1,
    position: 'absolute',
    top: '0',
  },
  variants: {},
}));

type FormErrorTextProps = React.PropsWithChildren<StyleVariants<typeof applyVariants>>;

export const FormErrorText = forwardRef<HTMLElement, FormErrorTextProps>((props, ref) => {
  const { hasError, errorMessageId } = useFormControl() || {};

  if (!hasError && !props.children) {
    return null;
  }

  const { children, ...rest } = props;

  return (
    <Text
      ref={ref}
      variant='smallRegular'
      colorScheme='danger'
      aria-live='polite'
      id={errorMessageId}
      {...rest}
      css={applyVariants(props)}
    >
      <Icon
        colorScheme={'danger'}
        icon={ExclamationCircle}
      />
      {children}
    </Text>
  );
});
