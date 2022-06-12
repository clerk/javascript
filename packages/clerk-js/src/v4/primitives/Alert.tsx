import React from 'react';

import { common, createVariants, StyleVariants } from '../styledSystem';
import { Flex } from './Flex';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    padding: `${theme.space.$3} ${theme.space.$4}`,
    backgroundColor: theme.colors.$blackAlpha50,
    ...common.borderVariants(theme).normal,
  },
  variants: {},
}));

export type AlertProps = React.PropsWithChildren<StyleVariants<typeof applyVariants>>;

export const Alert = (props: AlertProps): JSX.Element => {
  return (
    <Flex
      align='center'
      justify='start'
      {...filterProps(props)}
      css={applyVariants(props)}
    >
      {props.children}
    </Flex>
  );
};
