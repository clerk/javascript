import React, { forwardRef } from 'react';

import { Icon } from '../customizables';
import { ExclamationCircle } from '../icons';
import type { StyleVariants } from '../styledSystem';
import { animations, createVariants } from '../styledSystem';
import { useFormField } from './hooks/useFormField';
import { Text } from './Text';

const { applyVariants } = createVariants(theme => ({
  base: {
    marginTop: theme.sizes.$1x5,
    animation: `${animations.textInSmall} ${theme.transitionDuration.$fast}`,
    display: 'flex',
    gap: theme.sizes.$1,
    position: 'absolute',
    top: '0',
    textAlign: 'left',
  },
  variants: {},
}));

type FormErrorTextProps = React.PropsWithChildren<StyleVariants<typeof applyVariants>>;

export const FormErrorText = forwardRef<HTMLElement, FormErrorTextProps>((props, ref) => {
  const { hasError, errorMessageId } = useFormField() || {};

  if (!hasError && !props.children) {
    return null;
  }

  const { children, ...rest } = props;

  return (
    <Text
      ref={ref}
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
