import type { PropsOfComponent, StyleVariants } from '../styledSystem';
import { common, createCssVariables, createVariants } from '../styledSystem';
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
        [vars.bg]: colors.setAlpha(theme.colors.$primary400, 0.2),
      },
      danger: {
        [vars.accent]: theme.colors.$danger500,
        [vars.bg]: theme.colors.$danger100,
      },
      neutral: {
        [vars.accent]: theme.colors.$blackAlpha600,
        [vars.bg]: theme.colors.$blackAlpha200,
      },
      success: {
        [vars.accent]: theme.colors.$success500,
        [vars.bg]: colors.setAlpha(theme.colors.$success50, 0.2),
      },
      warning: {
        [vars.accent]: theme.colors.$warning600,
        [vars.bg]: theme.colors.$warning100,
      },
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
    textVariant: 'caption',
  },
}));

// @ts-ignore
export type BadgeProps = PropsOfComponent<typeof Flex> & StyleVariants<typeof applyVariants>;

export const Badge = (props: BadgeProps) => {
  return (
    <Flex
      {...filterProps(props)}
      center
      as='span'
      css={applyVariants(props) as any}
    />
  );
};
