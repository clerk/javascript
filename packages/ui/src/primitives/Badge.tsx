import type { PropsOfComponent, StyleVariants } from '../styledSystem';
import { common, createCssVariables, createVariants } from '../styledSystem';
import { Flex } from './Flex';

const vars = createCssVariables('accent', 'bg', 'borderColor');

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    color: vars.accent,
    flexShrink: 0,
    backgroundColor: vars.bg,
    boxShadow: theme.shadows.$badge,
    borderWidth: theme.borderWidths.$normal,
    borderStyle: theme.borderStyles.$solid,
    borderColor: vars.borderColor,
    borderRadius: theme.radii.$sm,
    padding: `${theme.space.$0x25} ${theme.space.$1x5}`,
    display: 'inline-flex',
    marginRight: '1px',
  },
  variants: {
    textVariant: { ...common.textVariants(theme) },
    colorScheme: {
      primary: {
        [vars.accent]: theme.colors.$borderAlpha600,
        [vars.bg]: theme.colors.$borderAlpha50,
        [vars.borderColor]: theme.colors.$borderAlpha150,
      },
      secondary: {
        [vars.accent]: theme.colors.$colorPrimaryForeground,
        [vars.bg]: theme.colors.$primary500,
        [vars.borderColor]: theme.colors.$primary500,
      },
      danger: {
        [vars.accent]: theme.colors.$danger500,
        [vars.bg]: theme.colors.$dangerAlpha50,
        [vars.borderColor]: theme.colors.$dangerAlpha300,
      },
      success: {
        [vars.accent]: theme.colors.$success500,
        [vars.bg]: theme.colors.$successAlpha50,
        [vars.borderColor]: theme.colors.$successAlpha300,
      },
      warning: {
        [vars.accent]: theme.colors.$warning500,
        [vars.bg]: theme.colors.$warningAlpha50,
        [vars.borderColor]: theme.colors.$warningAlpha300,
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
      data-color={props.colorScheme || 'primary'}
    />
  );
};
