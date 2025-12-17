import { useReverification, useUser } from '@clerk/shared/react';
import { Fragment, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/ui/utils/errorHandler';

import { Badge, Box, Flex, Image, localizationKeys, Text } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useEnabledThirdPartyProviders } from '../../hooks';
import type { PropsOfComponent } from '../../styledSystem';
import { RemoveWeb3WalletForm } from './RemoveResourceForm';
import { sortIdentificationBasedOnVerification } from './utils';
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
    const [actionValue, setActionValue] = useState<string | null>(null);

    if (!shouldAllowCreation && !hasWeb3Wallets) {
      return null;
    }

    return (
      <ProfileSection.Root
        title={localizationKeys('userProfile.start.web3WalletsSection.title')}
        centered={false}
        id='web3Wallets'
      >
        <Card.Alert>{card.error}</Card.Alert>
        <Action.Root
          value={actionValue}
          onChange={setActionValue}
        >
          <ProfileSection.ItemList id='web3Wallets'>
            {sortIdentificationBasedOnVerification(user?.web3Wallets, user?.primaryWeb3WalletId).map(wallet => {
              const strategy = wallet.verification.strategy as keyof typeof strategyToDisplayData;
              const walletId = wallet.id;
              return (
                strategyToDisplayData[strategy] && (
                  <Fragment key={wallet.id}>
                    <ProfileSection.Item
                      key={walletId}
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
                            {user?.primaryWeb3WalletId === walletId && (
                              <Badge localizationKey={localizationKeys('badge__primary')} />
                            )}
                            {wallet.verification.status !== 'verified' && (
                              <Badge localizationKey={localizationKeys('badge__unverified')} />
                            )}
                          </Flex>
                        </Box>
                      </Flex>
                      <Web3WalletMenu walletId={walletId} />
                    </ProfileSection.Item>

                    <Action.Open value={`remove-${walletId}`}>
                      <Action.Card variant='destructive'>
                        <RemoveWeb3WalletScreen walletId={wallet.id} />
                      </Action.Card>
                    </Action.Open>
                  </Fragment>
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

const Web3WalletMenu = ({ walletId }: { walletId: string }) => {
  const card = useCardState();
  const { open } = useActionContext();
  const { user } = useUser();
  const isPrimary = user?.primaryWeb3WalletId === walletId;
  const setPrimary = useReverification(() => {
    return user?.update({ primaryWeb3WalletId: walletId });
  });

  const actions = (
    [
      !isPrimary
        ? {
            label: localizationKeys('userProfile.start.web3WalletsSection.detailsAction__nonPrimary'),
            onClick: () => {
              setPrimary().catch(e => handleError(e, [], card.setError));
            },
          }
        : null,
      {
        label: localizationKeys('userProfile.start.web3WalletsSection.destructiveAction'),
        isDestructive: true,
        onClick: () => open(`remove-${walletId}`),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};
