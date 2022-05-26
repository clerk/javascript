import React from 'react';

import { Text } from '../primitives';
import { createVariants, cssutils, PickSiblingProps, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    boxSizing: 'border-box',
    margin: 0,
    ...cssutils.addFocusRing(theme),
    '&:hover': { textDecoration: 'underline' },
  },
  variants: {
    colorScheme: {
      primary: {
        color: theme.colors.$primary500,
        '&:hover': { color: theme.colors.$primary400 },
        '&:active': { color: theme.colors.$primary600 },
      },
      danger: {
        color: theme.colors.$danger500,
        '&:hover': { color: theme.colors.$danger400 },
        '&:active': { color: theme.colors.$danger600 },
      },
      neutral: {
        color: theme.colors.$gray500,
        '&:hover': { color: theme.colors.$gray400 },
        '&:active': { color: theme.colors.$gray600 },
      },
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
  },
}));

type SiblingProps = PickSiblingProps<typeof Text, 'size'>;
type OwnProps = { isExternal?: boolean };
export type LinkProps = PrimitiveProps<'a'> & OwnProps & SiblingProps & StyleVariants<typeof applyVariants>;

export const Link = (props: LinkProps): JSX.Element => {
  const { isExternal, children, size, ...rest } = props;
  return (
    <a
      {...filterProps(rest)}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener' : undefined}
      css={applyVariants(props)}
    >
      <Text
        variant='link'
        size={size}
      >
        {children}
      </Text>
    </a>
  );
};
