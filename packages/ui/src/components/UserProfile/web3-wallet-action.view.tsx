import { descriptors, localizationKeys } from '@/customizables';
import { ProviderIcon } from '@/ui/common';
import { Web3SelectSolanaWalletScreen } from '@/ui/components/UserProfile/Web3SelectSolanaWalletScreen';
import { Action } from '@/ui/elements/Action';
import { ProfileSection } from '@/ui/elements/Section';

import type { useWeb3WalletActionController } from './web3-wallet-action.controller';

export const Web3WalletActionView = ({
  controller,
}: {
  controller: ReturnType<typeof useWeb3WalletActionController>;
}) => {
  if (controller.strategies.length === 0) {
    return null;
  }

  return (
    <>
      <Action.Closed value='web3Wallets'>
        <ProfileSection.ActionMenu
          id='web3Wallets'
          triggerLocalizationKey={localizationKeys('userProfile.start.web3WalletsSection.primaryButton')}
        >
          {controller.strategies.map(row => (
            <ProfileSection.ActionMenuItem
              key={row.strategy}
              id={row.id}
              onClick={() => {
                void controller.connect({ strategy: row.strategy });
              }}
              isLoading={controller.isLoading(row.strategy)}
              isDisabled={controller.isDisabled}
              localizationKey={localizationKeys('userProfile.web3WalletPage.web3WalletButtonsBlockButton', {
                provider: row.name,
              })}
              sx={t => ({
                justifyContent: 'start',
                gap: t.space.$2,
              })}
              leftIcon={
                <ProviderIcon
                  id={row.id}
                  iconUrl={row.iconUrl}
                  name={row.name}
                  isLoading={controller.isLoading(row.strategy)}
                  isDisabled={controller.isDisabled}
                  alt={`Connect ${row.name}`}
                  elementDescriptor={descriptors.providerIcon}
                  elementId={descriptors.providerIcon.setId(row.id)}
                />
              }
            />
          ))}
        </ProfileSection.ActionMenu>
      </Action.Closed>
      <Action.Open value='web3Wallets'>
        <Action.Card>
          <Web3SelectSolanaWalletScreen
            key={controller.requestKey}
            onConnect={controller.connect}
          />
        </Action.Card>
      </Action.Open>
    </>
  );
};
