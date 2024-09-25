import { useUser } from '@clerk/shared/react';

import { Badge, Box, Flex, Image, localizationKeys, Text } from '../../customizables';
import { Card, ProfileSection, ThreeDotsMenu, useCardState, withCardStateProvider } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useEnabledThirdPartyProviders } from '../../hooks';
import type { PropsOfComponent } from '../../styledSystem';
import { RemoveWeb3WalletForm } from './RemoveResourceForm';
import { AddWeb3WalletActionMenu } from './Web3Form';

type RemoveWeb3WalletScreenProps = { walletId: string };
const RemoveWeb3WalletScreen = (props: RemoveWeb3WalletScreenProps) => {
  const { close } = useActionContext();
  return (
    <RemoveWeb3WalletForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

const shortenWeb3Address = (address: string) => {
  if (address.length <= 10) {
    return address;
  }
  return address.slice(0, 6) + '...' + address.slice(-4);
};

export const Web3Section = withCardStateProvider(
  ({ shouldAllowCreation = true }: { shouldAllowCreation?: boolean }) => {
    const { user } = useUser();
    const card = useCardState();
    const { strategyToDisplayData } = useEnabledThirdPartyProviders();
    const hasWeb3Wallets = Boolean(user?.web3Wallets?.length);

    if (!shouldAllowCreation && !hasWeb3Wallets) {
      return null;
    }

    return (
      <ProfileSection.Root
        title={localizationKeys('userProfile.start.web3WalletsSection.title')}
        id='web3Wallets'
      >
        <Card.Alert>{card.error}</Card.Alert>
        <Action.Root>
          <ProfileSection.ItemList id='web3Wallets'>
            {user?.web3Wallets.map(wallet => {
              const strategy = wallet.verification.strategy as keyof typeof strategyToDisplayData;

              return (
                strategyToDisplayData[strategy] && (
                  <Action.Root key={wallet.id}>
                    <Action.Closed value=''>
                      <ProfileSection.Item
                        key={wallet.id}
                        id='web3Wallets'
                        align='start'
                      >
                        <Flex sx={t => ({ alignItems: 'center', gap: t.space.$2, width: '100%' })}>
                          {strategyToDisplayData[strategy].iconUrl && (
                            <Image
                              src={strategyToDisplayData[strategy].iconUrl}
                              alt={strategyToDisplayData[strategy].name}
                              sx={theme => ({ width: theme.sizes.$4 })}
                            />
                          )}
                          <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            <Flex
                              gap={2}
                              justify='start'
                            >
                              <Text>
                                {strategyToDisplayData[strategy].name} ({shortenWeb3Address(wallet.web3Wallet)})
                              </Text>
                              {user?.primaryWeb3WalletId === wallet.id && (
                                <Badge localizationKey={localizationKeys('badge__primary')} />
                              )}
                              {wallet.verification.status !== 'verified' && (
                                <Badge localizationKey={localizationKeys('badge__unverified')} />
                              )}
                            </Flex>
                          </Box>
                        </Flex>
                        <Web3WalletMenu />
                      </ProfileSection.Item>
                    </Action.Closed>

                    <Action.Open value='remove'>
                      <Action.Card variant='destructive'>
                        <RemoveWeb3WalletScreen walletId={wallet.id} />
                      </Action.Card>
                    </Action.Open>
                  </Action.Root>
                )
              );
            })}
          </ProfileSection.ItemList>
          {shouldAllowCreation && <AddWeb3WalletActionMenu />}
        </Action.Root>
      </ProfileSection.Root>
    );
  },
);

const Web3WalletMenu = () => {
  const { open } = useActionContext();

  const actions = (
    [
      {
        label: localizationKeys('userProfile.start.web3WalletsSection.destructiveAction'),
        onClick: () => open('remove'),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};
