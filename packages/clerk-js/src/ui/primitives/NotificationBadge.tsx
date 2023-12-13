import type { PropsOfComponent, StyleVariants } from '../styledSystem';
import { common, createCssVariables, createVariants } from '../styledSystem';
import { Flex } from './Flex';

const vars = createCssVariables('accent', 'bg');

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    color: vars.accent,
    backgroundColor: vars.bg,
    borderRadius: theme.radii.$sm,
    height: theme.space.$4,
    minWidth: theme.space.$4,
    padding: `${theme.space.$0x5}`,
    display: 'inline-flex',
  },
  variants: {
    textVariant: { ...common.textVariants(theme) },
    colorScheme: {
      primary: {
        [vars.accent]: theme.colors.$colorTextOnPrimaryBackground,
        [vars.bg]: theme.colors.$primary500,
      },
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
    textVariant: 'caption',
  },
}));

// @ts-ignore
export type NotificationBadgeProps = PropsOfComponent<typeof Flex> & StyleVariants<typeof applyVariants>;

export const NotificationBadge = (props: NotificationBadgeProps) => {
  return (
    <Flex
      {...filterProps(props)}
      center
      as='span'
      css={[
        applyVariants(props) as any,
        {
          lineHeight: 0,
        },
      ]}
    />
  );
};
