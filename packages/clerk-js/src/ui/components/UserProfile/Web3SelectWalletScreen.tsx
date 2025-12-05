import type { Web3Strategy } from '@clerk/shared/types';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { MAINNET_ENDPOINT } from '@solana/wallet-standard';
import { useMemo } from 'react';

import { Action } from '@/ui/elements/Action';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormContainer } from '@/ui/elements/FormContainer';

import { Button, Grid, Image, localizationKeys, Text } from '../../customizables';

export type Web3SelectWalletProps = {
  onConnect: (params: { strategy: Web3Strategy; walletName: string }) => Promise<void>;
};

const Web3SelectWalletInner = ({ onConnect }: Web3SelectWalletProps) => {
  const card = useCardState();
  const { wallets } = useWallet();
  const { close } = useActionContext();

  const installedWallets = useMemo(
    () =>
      wallets
        .filter(w => w.readyState === WalletReadyState.Installed)
        .map(wallet => ({
          name: wallet.adapter.name,
          icon: wallet.adapter.icon,
        })),
    [wallets],
  );

  if (installedWallets.length === 0) {
    return null;
  }

  const onClick = async (wallet: { name: string; icon: string }) => {
    card.setLoading(wallet.name);
    try {
      await onConnect({ strategy: 'web3_solana_signature', walletName: wallet.name });
      card.setIdle();
    } catch (err) {
      card.setIdle();
      console.error(err);
    } finally {
      close();
    }
  };

  return (
    <Action.Card>
      <FormContainer
        headerTitle='Add Solana wallet'
        headerSubtitle={localizationKeys('userProfile.start.web3WalletsSection.primaryButton')}
      >
        <Form.Root>
          <Form.ControlRow elementId='web3WalletName'>
            <Grid
              columns={2}
              gap={3}
            >
              {installedWallets.map(wallet => (
                <Button
                  key={wallet.name}
                  textVariant='buttonLarge'
                  isDisabled={card.isLoading}
                  isLoading={card.isLoading && card.loadingMetadata === wallet.name}
                  sx={theme => ({
                    gap: theme.space.$4,
                    justifyContent: 'flex-start',
                  })}
                  variant='outline'
                  onClick={() => onClick(wallet)}
                >
                  {wallet.icon && (
                    <Image
                      src={wallet.icon}
                      alt={wallet.name}
                      sx={theme => ({ width: theme.sizes.$4, height: 'auto', maxWidth: '100%' })}
                    />
                  )}
                  <Text
                    as='span'
                    truncate
                    variant='buttonLarge'
                  >
                    {wallet.name}
                  </Text>
                </Button>
              ))}
            </Grid>
          </Form.ControlRow>
        </Form.Root>
      </FormContainer>
    </Action.Card>
  );
};

export const Web3SelectWalletScreen = ({ onConnect }: Web3SelectWalletProps) => {
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
        <Web3SelectWalletInner onConnect={onConnect} />
      </WalletProvider>
    </ConnectionProvider>
  );
};
