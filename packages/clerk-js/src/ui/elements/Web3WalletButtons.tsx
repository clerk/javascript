import { WalletReadyState } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { MAINNET_ENDPOINT } from '@solana/wallet-standard';
import React, { useMemo } from 'react';

import { Button, Flex, Grid, Image, Link, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';

type Web3WalletButtonsProps = {
  onSelect: (props: { walletName: string }) => Promise<void>;
};

const Web3WalletButtonsInner = ({ onSelect }: Web3WalletButtonsProps) => {
  const card = useCardState();
  const { wallets } = useWallet();

  // Filter to only show installed wallets
  const installedWallets = React.useMemo(
    () =>
      wallets
        .filter(w => {
          return w.readyState === WalletReadyState.Installed;
        })
        .map(wallet => {
          return {
            name: wallet.adapter.name,
            icon: wallet.adapter.icon,
          };
        }),
    [wallets],
  );

  if (installedWallets.length === 0) {
    return (
      <Card.Alert>
        No Solana wallets detected. Please install a Solana supported wallet extension like{' '}
        <Link
          href='https://phantom.app/'
          target='_blank'
          rel='noopener noreferrer'
          colorScheme='danger'
          isExternal
        >
          Phantom
        </Link>{' '}
        or{' '}
        <Link
          href='https://www.backpack.app/'
          target='_blank'
          rel='noopener noreferrer'
          isExternal
          colorScheme='danger'
        >
          Backpack
        </Link>
        .
      </Card.Alert>
    );
  }
  return (
    <Grid
      columns={2}
      gap={3}
    >
      {installedWallets.map(w => (
        <Button
          key={w.name}
          block
          variant='outline'
          textVariant='buttonLarge'
          isDisabled={card.isLoading}
          isLoading={card.isLoading && card.loadingMetadata === w.name}
          onClick={() => void onSelect({ walletName: w.name })}
          sx={theme => ({
            gap: theme.space.$4,
            justifyContent: 'flex-start',
          })}
        >
          <Flex
            as='span'
            center
            sx={theme => ({ flex: `0 0 ${theme.space.$4}` })}
          >
            {w.icon && (
              <Image
                src={w.icon}
                alt={w.name}
                sx={theme => ({ width: theme.sizes.$4, height: 'auto', maxWidth: '100%' })}
              />
            )}
          </Flex>
          <Text
            as='span'
            truncate
            variant='buttonLarge'
          >
            {w.name}
          </Text>
        </Button>
      ))}
    </Grid>
  );
};

export const Web3WalletButtons = (props: Web3WalletButtonsProps) => {
  const network = MAINNET_ENDPOINT;
  const wallets = useMemo(() => [], [network]);
  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider
        wallets={wallets}
        onError={err => {
          console.error(err);
        }}
      >
        {/* <CardStateProvider> */}
        <Web3WalletButtonsInner onSelect={props.onSelect} />
        {/* </CardStateProvider> */}
      </WalletProvider>
    </ConnectionProvider>
  );
};
