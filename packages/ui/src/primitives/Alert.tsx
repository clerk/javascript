import type { StyleVariants } from '../styledSystem';
import { common, createVariants } from '../styledSystem';
import type { FlexProps } from './Flex';
import { Flex } from './Flex';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    padding: `${theme.space.$3} ${theme.space.$4}`,
    backgroundColor: theme.colors.$neutralAlpha50,
    ...common.borderVariants(theme, {
      hoverStyles: false,
    }).normal,
  },
  variants: {
    colorScheme: {
      danger: {
        color: theme.colors.$danger500,
        backgroundColor: theme.colors.$dangerAlpha50,
        ...common.borderVariants(theme, {
          hasError: true,
        }).normal,
      },
      info: {
        color: theme.colors.$neutralAlpha150,
        background: theme.colors.$neutralAlpha50,
      },
      warning: {
        backgroundColor: theme.colors.$warningAlpha100,
        ...common.borderVariants(theme, {
          hasWarning: true,
          hoverStyles: false,
        }).normal,
      },
    },
  },
  defaultVariants: {
    colorScheme: 'warning',
  },
}));

export type AlertProps = FlexProps & StyleVariants<typeof applyVariants>;

export const Alert = (props: AlertProps): JSX.Element => {
  return (
    // @ts-ignore
    <Flex
      // @ts-ignore
      align='center'
      // @ts-ignore
      justify='start'
      {...filterProps(props)}
      css={applyVariants(props) as any}
    >
      {props.children}
    </Flex>
  );
};
