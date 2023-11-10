import type { StyleVariants } from '../styledSystem';
import { common, createVariants } from '../styledSystem';
import type { FlexProps } from './Flex';
import { Flex } from './Flex';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    padding: `${theme.space.$3} ${theme.space.$4}`,
    backgroundColor: theme.colors.$blackAlpha50,
    ...common.borderVariants(theme).normal,
  },
  variants: {},
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
      css={applyVariants(props)}
    >
      {props.children}
    </Flex>
  );
};
