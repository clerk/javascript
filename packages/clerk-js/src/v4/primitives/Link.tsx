import React from 'react';

import { common, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    margin: 0,
    cursor: 'pointer',
    ...common.focusRing(theme),
    '&:hover': { textDecoration: 'underline' },
  },
  variants: {
    variant: common.textVariants(theme),
    size: common.fontSizeVariants(theme),
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
        color: theme.colors.$colorTextSecondary,
      },
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
    variant: 'textSmallRegular',
  },
}));

type OwnProps = { isExternal?: boolean };
export type LinkProps = PrimitiveProps<'a'> & OwnProps & StyleVariants<typeof applyVariants>;

export const Link = (props: LinkProps): JSX.Element => {
  const { isExternal, children, ...rest } = props;
  return (
    <a
      {...filterProps(rest)}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener' : undefined}
      css={applyVariants(props)}
    >
      {children}
    </a>
  );
};
