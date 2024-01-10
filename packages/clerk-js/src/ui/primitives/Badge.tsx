import type { PropsOfComponent, StyleVariants } from '../styledSystem';
import { common, createCssVariables, createVariants } from '../styledSystem';
import { Flex } from './Flex';

const vars = createCssVariables('accent', 'bg', 'borderColor');

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    color: vars.accent,
    backgroundColor: vars.bg,
    boxShadow: theme.shadows.$badge,
    border: theme.borders.$normal,
    borderColor: vars.borderColor,
    borderRadius: theme.radii.$sm,
    padding: `${theme.space.$none} ${theme.space.$1x5}`,
    display: 'inline-flex',
    marginRight: '1px',
  },
  variants: {
    textVariant: { ...common.textVariants(theme) },
    colorScheme: {
      primary: {
        [vars.accent]: theme.colors.$blackAlpha500,
        [vars.bg]: theme.colors.$blackAlpha50,
        [vars.borderColor]: theme.colors.$blackAlpha100,
      },
      danger: {
        [vars.accent]: theme.colors.$danger500,
        [vars.bg]: theme.colors.$danger50,
        [vars.borderColor]: theme.colors.$danger200,
      },
      success: {
        [vars.accent]: theme.colors.$success500,
        [vars.bg]: theme.colors.$success50,
        [vars.borderColor]: theme.colors.$success200,
      },
      warning: {
        [vars.accent]: theme.colors.$warning500,
        [vars.bg]: theme.colors.$warning50,
        [vars.borderColor]: theme.colors.$warning200,
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
