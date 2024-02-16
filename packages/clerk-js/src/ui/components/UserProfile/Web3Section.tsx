import { useUser } from '@clerk/shared/react';

import { Box, Flex, Image, localizationKeys, Text } from '../../customizables';
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

export const Web3Section = withCardStateProvider(() => {
  const { user } = useUser();
  const card = useCardState();
  const { strategyToDisplayData } = useEnabledThirdPartyProviders();

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
                      hoverable
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
                            as={'span'}
                            gap={2}
                            justify='start'
                          >
                            <Text>
                              {strategyToDisplayData[strategy].name} ({wallet.web3Wallet})
                            </Text>
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
        <AddWeb3WalletActionMenu />
      </Action.Root>
    </ProfileSection.Root>
  );
});

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
