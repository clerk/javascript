import { useReverification, useUser } from '@clerk/shared/react';
import type { Web3Provider, Web3Strategy } from '@clerk/shared/types';

import { Web3SelectSolanaWalletScreen } from '@/ui/components/UserProfile/Web3SelectSolanaWalletScreen';
import { Action } from '@/ui/elements/Action';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { web3CallbackErrorHandler } from '@/ui/utils/web3CallbackErrorHandler';

import { generateWeb3Signature, getWeb3Identifier } from '../../../utils/web3';
import { descriptors, Image, localizationKeys } from '../../customizables';
import { useEnabledThirdPartyProviders } from '../../hooks';

export const AddWeb3WalletActionMenu = () => {
  const card = useCardState();
  const { open } = useActionContext();
  const { user } = useUser();
  const { strategies, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const enabledStrategies = strategies.filter(s => s.startsWith('web3')) as Web3Strategy[];
  const connectedStrategies = user?.verifiedWeb3Wallets?.map(w => w.verification.strategy) ?? ([] as Web3Strategy[]);
  const unconnectedStrategies = enabledStrategies.filter(strategy => {
    return !connectedStrategies.includes(strategy) && strategyToDisplayData[strategy];
  });

  if (unconnectedStrategies.length === 0) {
    return null;
  }

  const createWeb3Wallet = useReverification((identifier: string) =>
    user?.createWeb3Wallet({ web3Wallet: identifier }),
  );

  // If the user selects `web3_solana_signature` as their strategy,
  // we need to obtain the wallet name to use when connecting and signing the message during the auth flow
  //
  // Otherwise, our current Web3 providers are all based on the wallet provider name,
  // which is sufficient for our current use case when connecting to a wallet.
  const connect = async ({ strategy, walletName }: { strategy: Web3Strategy; walletName?: string }) => {
    if (strategy === 'web3_solana_signature' && !walletName) {
      open('web3Wallets');
      return;
    }
    const provider = strategy.replace('web3_', '').replace('_signature', '') as Web3Provider;
    card.setError(undefined);

    try {
      card.setLoading(strategy);
      const identifier = await getWeb3Identifier({ provider, walletName });

      if (!user) {
        throw new Error('user is not defined');
      }

      let web3Wallet = await createWeb3Wallet(identifier);
      web3Wallet = await web3Wallet?.prepareVerification({ strategy });
      const message = web3Wallet?.verification.message as string;
      const signature = await generateWeb3Signature({ identifier, nonce: message, provider, walletName });
      await web3Wallet?.attemptVerification({ signature });
      card.setIdle();
    } catch (err) {
      card.setIdle();
      web3CallbackErrorHandler(err, card.setError);
    }
  };

  return (
    <>
      <Action.Closed value='web3Wallets'>
        <ProfileSection.ActionMenu
          id='web3Wallets'
          triggerLocalizationKey={localizationKeys('userProfile.start.web3WalletsSection.primaryButton')}
        >
          {unconnectedStrategies.map(strategy => (
            <ProfileSection.ActionMenuItem
              key={strategy}
              id={strategyToDisplayData[strategy].id}
              onClick={() => connect({ strategy })}
              isLoading={card.loadingMetadata === strategy}
              isDisabled={card.isLoading}
              localizationKey={localizationKeys('userProfile.web3WalletPage.web3WalletButtonsBlockButton', {
                provider: strategyToDisplayData[strategy].name,
              })}
              sx={t => ({
                justifyContent: 'start',
                gap: t.space.$2,
              })}
              leftIcon={
                <Image
                  elementDescriptor={descriptors.providerIcon}
                  elementId={descriptors.providerIcon.setId(strategyToDisplayData[strategy].id)}
                  isLoading={card.loadingMetadata === strategy}
                  isDisabled={card.isLoading}
                  src={strategyToDisplayData[strategy].iconUrl}
                  alt={`Connect ${strategyToDisplayData[strategy].name}`}
                  sx={theme => ({ width: theme.sizes.$5 })}
                />
              }
            />
          ))}
        </ProfileSection.ActionMenu>
      </Action.Closed>
      <Action.Open value='web3Wallets'>
        <Action.Card>
          <Web3SelectSolanaWalletScreen onConnect={connect} />
        </Action.Card>
      </Action.Open>
    </>
  );
};
