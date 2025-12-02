import { useReverification, useUser } from '@clerk/shared/react';
import type { Web3Provider, Web3Strategy } from '@clerk/shared/types';

import { useWizard, Wizard } from '@/ui/common';
import { Web3SelectWalletScreen } from '@/ui/components/UserProfile/Web3SelectWalletScreen';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { getFieldError, handleError } from '@/ui/utils/errorHandler';

import { generateWeb3Signature, getWeb3Identifier } from '../../../utils/web3';
import { descriptors, Image, localizationKeys, Text } from '../../customizables';
import { useEnabledThirdPartyProviders } from '../../hooks';

export const AddWeb3WalletActionMenu = withCardStateProvider(() => {
  const card = useCardState();
  const { user } = useUser();

  const wizard = useWizard();

  const createWeb3Wallet = useReverification((identifier: string) =>
    user?.createWeb3Wallet({ web3Wallet: identifier }),
  );

  const connect = async ({ strategy, walletName }: { strategy: Web3Strategy; walletName?: string }) => {
    if (strategy === 'web3_solana_signature' && !walletName) {
      wizard.nextStep();
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
      const fieldError = getFieldError(err);
      if (fieldError) {
        card.setError(fieldError.longMessage);
      } else {
        handleError(err, [], card.setError);
      }
    }
  };

  return (
    <Wizard {...wizard.props}>
      <Web3SelectStrategyScreen onConnect={connect} />

      <Web3SelectWalletScreen onConnect={connect} />
    </Wizard>
  );
});

const Web3SelectStrategyScreen = ({
  onConnect,
}: {
  onConnect: (params: { strategy: Web3Strategy; walletName?: string }) => Promise<void>;
}) => {
  const card = useCardState();
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

  return (
    <>
      <ProfileSection.ActionMenu
        id='web3Wallets'
        triggerLocalizationKey={localizationKeys('userProfile.start.web3WalletsSection.primaryButton')}
      >
        {unconnectedStrategies.map(strategy => (
          <ProfileSection.ActionMenuItem
            key={strategy}
            id={strategyToDisplayData[strategy].id}
            onClick={() => onConnect({ strategy })}
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
      {card.error && (
        <Text
          colorScheme='danger'
          sx={t => ({
            padding: t.sizes.$1x5,
            paddingLeft: t.sizes.$8x5,
          })}
        >
          {card.error}
        </Text>
      )}
    </>
  );
};
