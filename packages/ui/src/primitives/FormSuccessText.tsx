import React, { forwardRef } from 'react';

import { Icon } from '../customizables';
import { CheckCircle } from '../icons';
import type { StyleVariants } from '../styledSystem';
import { animations, createVariants } from '../styledSystem';
import { Text } from './Text';

export const { applyVariants } = createVariants(theme => ({
  base: {
    marginTop: theme.sizes.$1x5,
    animation: `${animations.textInSmall} ${theme.transitionDuration.$fast}`,
    display: 'flex',
    gap: theme.sizes.$1,
    position: 'absolute',
    top: '0',
    textAlign: 'start',
  },
  variants: {},
}));

export type FormTextProps = React.PropsWithChildren<StyleVariants<typeof applyVariants>>;

export const FormSuccessText = forwardRef<HTMLElement, FormTextProps>((props, ref) => {
  const { children, ...rest } = props;

  return (
    <Text
      ref={ref}
      colorScheme='secondary'
      {...rest}
      css={applyVariants(props) as any}
    >
      <Icon
        colorScheme={'success'}
        icon={CheckCircle}
      />
      {children}
    </Text>
  );
});
