import { ExclamationTriangle, InformationCircle } from '../icons';
import type { StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    marginRight: theme.space.$2x5,
    width: theme.sizes.$4,
    height: theme.sizes.$4,
  },
  variants: {
    colorScheme: {
      danger: { color: theme.colors.$danger500 },
      warning: { color: theme.colors.$warning500 },
      success: { color: theme.colors.$success500 },
      primary: { color: theme.colors.$primary500 },
      info: { color: theme.colors.$colorMutedForeground },
    },
  },
}));

type OwnProps = { variant: 'danger' | 'warning' | 'info' };

export type AlertIconProps = OwnProps & StyleVariants<typeof applyVariants>;

export const AlertIcon = (props: AlertIconProps): JSX.Element => {
  const { variant, ...rest } = props;
  const Icon = {
    warning: ExclamationTriangle,
    danger: ExclamationTriangle,
    primary: InformationCircle,
    info: InformationCircle,
  }[variant];
  return (
    <Icon
      {...filterProps(rest)}
      css={applyVariants(props) as any}
    />
  );
};
