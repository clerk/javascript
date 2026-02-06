import { Box, descriptors, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { common } from '../styledSystem';

type WalletInitialIconProps = PropsOfComponent<typeof Box> & {
  value: string;
  /**
   * The wallet provider name
   */
  id: string;
};

export const WalletInitialIcon = (props: WalletInitialIconProps) => {
  const { value, id, ...rest } = props;

  return (
    <Box
      as='span'
      elementDescriptor={[descriptors.walletIcon, descriptors.web3SolanaWalletButtonsWalletInitialIcon]}
      elementId={descriptors.web3SolanaWalletButtonsWalletInitialIcon.setId(id)}
      sx={t => ({
        ...common.centeredFlex('inline-flex'),
        width: t.space.$4,
        height: t.space.$4,
        borderRadius: t.radii.$sm,
        color: t.colors.$colorPrimaryForeground,
        backgroundColor: t.colors.$primary500,
      })}
      {...rest}
    >
      <Text
        as='span'
        variant='buttonSmall'
        sx={{
          ...common.centeredFlex('inline-flex'),
          width: '100%',
        }}
      >
        {value[0].toUpperCase() ?? ''}
      </Text>
    </Box>
  );
};
