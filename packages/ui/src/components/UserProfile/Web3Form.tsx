import { createWeb3 } from '@clerk/shared/internal/clerk-js/web3';
import { useReverification, useUser } from '@clerk/shared/react';
import type { Web3Provider, Web3Strategy } from '@clerk/shared/types';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { getFieldError, handleError } from '@/ui/utils/errorHandler';

import { useModuleManager } from '../../contexts';
import { descriptors, Image, localizationKeys, Text } from '../../customizables';
import { useEnabledThirdPartyProviders } from '../../hooks';

export const AddWeb3WalletActionMenu = withCardStateProvider(({ onClick }: { onClick?: () => void }) => {
  const card = useCardState();
  const { user } = useUser();
  const { strategies, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const moduleManager = useModuleManager();
  const enabledStrategies = strategies.filter(s => s.startsWith('web3')) as Web3Strategy[];
  const connectedStrategies = user?.verifiedWeb3Wallets.map(w => w.verification.strategy) as Web3Strategy[];
  const unconnectedStrategies = enabledStrategies.filter(strategy => {
    return !connectedStrategies.includes(strategy);
  });
  const createWeb3Wallet = useReverification((identifier: string) =>
    user?.createWeb3Wallet({ web3Wallet: identifier }),
  );

  const connect = async (strategy: Web3Strategy) => {
    const web3 = createWeb3(moduleManager);

    const provider = strategy.replace('web3_', '').replace('_signature', '') as Web3Provider;
    card.setError(undefined);

    try {
      card.setLoading(strategy);
      const identifier = await web3.getWeb3Identifier({ provider });

      if (!user) {
        throw new Error('user is not defined');
      }

      let web3Wallet = await createWeb3Wallet(identifier);
      web3Wallet = await web3Wallet?.prepareVerification({ strategy });
      const message = web3Wallet?.verification.message as string;
      const signature = await web3.generateWeb3Signature({ identifier, nonce: message, provider });
      await web3Wallet?.attemptVerification({ signature });
      card.setIdle();
    } catch (err: any) {
      card.setIdle();
      const fieldError = getFieldError(err);
      if (fieldError) {
        card.setError(fieldError.longMessage);
      } else {
        handleError(err, [], card.setError);
      }
    }
  };

  if (unconnectedStrategies.length === 0) {
    return null;
  }

  return (
    <>
      <ProfileSection.ActionMenu
        id='web3Wallets'
        triggerLocalizationKey={localizationKeys('userProfile.start.web3WalletsSection.primaryButton')}
        onClick={onClick}
      >
        {unconnectedStrategies.map(strategy => (
          <ProfileSection.ActionMenuItem
            key={strategy}
            id={strategyToDisplayData[strategy].id}
            onClick={() => {
              void connect(strategy);
            }}
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
});
