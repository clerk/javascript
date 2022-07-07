import React from 'react';

import { common, createCssVariables, createVariants, PropsOfComponent, StyleVariants } from '../styledSystem';
import { colors } from '../utils';
import { Flex } from './Flex';

const vars = createCssVariables('accent', 'bg');

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    color: vars.accent,
    backgroundColor: vars.bg,
    borderRadius: theme.radii.$sm,
    padding: `${theme.space.$0x5} ${theme.space.$1x5}`,
    display: 'inline-flex',
  },
  variants: {
    textVariant: { ...common.textVariants(theme) },
    colorScheme: {
      primary: {
        [vars.accent]: theme.colors.$primary500,
        [vars.bg]: theme.options.$darkMode
          ? colors.makeTransparent(theme.colors.$primary300, 0.8)
          : theme.colors.$primary50,
      },
      danger: {
        [vars.accent]: theme.colors.$danger500,
        [vars.bg]: theme.options.$darkMode
          ? colors.makeTransparent(theme.colors.$danger300, 0.8)
          : theme.colors.$danger50,
      },
      success: {
        [vars.accent]: theme.colors.$success500,
        [vars.bg]: theme.options.$darkMode
          ? colors.makeTransparent(theme.colors.$success300, 0.8)
          : theme.colors.$success50,
      },
      warning: {
        [vars.accent]: theme.colors.$warning500,
        [vars.bg]: theme.options.$darkMode
          ? colors.makeTransparent(theme.colors.$warning300, 0.8)
          : theme.colors.$warning50,
      },
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
    textVariant: 'smallMedium',
  },
}));

export type BadgeProps = PropsOfComponent<typeof Flex> & StyleVariants<typeof applyVariants>;

export const Badge = (props: BadgeProps) => {
  return (
    <Flex
      {...filterProps(props)}
      center
      as='span'
      css={applyVariants(props)}
    />
  );
};
