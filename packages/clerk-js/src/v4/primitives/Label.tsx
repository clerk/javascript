import React from 'react';

import { common, createCssVariables, createVariants, PropsOfComponent, StyleVariants } from '../styledSystem';
import { Flex } from './Flex';

const vars = createCssVariables('accent', 'bg');

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    color: vars.accent,
    backgroundColor: vars.bg,
    borderRadius: theme.radii.$sm,
    padding: `${theme.space.$0x5} ${theme.space.$2}`,
  },
  variants: {
    textVariant: { ...common.textVariants(theme) },
    colorScheme: {
      primary: {
        [vars.accent]: theme.colors.$primary500,
        [vars.bg]: theme.colors.$primary50,
      },
      danger: {
        [vars.accent]: theme.colors.$danger500,
        [vars.bg]: theme.colors.$danger50,
      },
      success: {
        [vars.accent]: theme.colors.$success500,
        [vars.bg]: theme.colors.$success50,
      },
      warning: {
        [vars.accent]: theme.colors.$warning500,
        [vars.bg]: theme.colors.$warning50,
      },
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
    textVariant: 'smallSemibold',
  },
}));

export type LabelProps = PropsOfComponent<typeof Flex> & StyleVariants<typeof applyVariants>;

export const Label = (props: LabelProps) => {
  return (
    <Flex
      {...filterProps(props)}
      center
      css={applyVariants(props)}
    />
  );
};
