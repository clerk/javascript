import { descriptors, Flex } from '@/customizables';
import { common } from '@/styledSystem';

type ProfileCardHeaderProps = React.PropsWithChildren;

export const ProfileCardHeader = (props: ProfileCardHeaderProps): JSX.Element => (
  <Flex
    as='header'
    {...props}
    sx={theme => ({
      gap: theme.space.$2,
      padding: `${theme.space.$5}`,
      borderBottomWidth: theme.borderWidths.$normal,
      borderBottomStyle: theme.borderStyles.$solid,
      borderBottomColor: theme.colors.$borderAlpha100,
    })}
  />
);

type ProfileCardFooterProps = React.PropsWithChildren;

export const ProfileCardFooter = (props: ProfileCardFooterProps): JSX.Element => (
  <Flex
    as='footer'
    elementDescriptor={descriptors.footer}
    align='center'
    justify='end'
    {...props}
    sx={theme => ({
      gap: theme.space.$2,
      padding: `${theme.space.$4}`,
      background: common.mutedBackground(theme),
      borderTopWidth: theme.borderWidths.$normal,
      borderTopStyle: theme.borderStyles.$solid,
      borderTopColor: theme.colors.$borderAlpha100,
    })}
  />
);
