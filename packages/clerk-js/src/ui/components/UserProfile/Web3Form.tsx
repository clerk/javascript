import { useUser } from '@clerk/shared/react';
import type { Web3Provider, Web3Strategy } from '@clerk/types';

import { generateWeb3Signature, getWeb3Identifier } from '../../../utils/web3';
import { descriptors, Image, localizationKeys } from '../../customizables';
import { ProfileSection, useCardState, withCardStateProvider } from '../../elements';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { getFieldError, handleError } from '../../utils';

export const AddWeb3WalletActionMenu = withCardStateProvider(() => {
  const card = useCardState();
  const { user } = useUser();
  const { strategies, strategyToDisplayData } = useEnabledThirdPartyProviders();

  const enabledStrategies = strategies.filter(s => s.startsWith('web3')) as Web3Strategy[];
  const connectedStrategies = user?.verifiedWeb3Wallets.map(w => w.verification.strategy) as Web3Strategy[];
  const unconnectedStrategies = enabledStrategies.filter(strategy => {
    return !connectedStrategies.includes(strategy);
  });

  const connect = async (strategy: Web3Strategy) => {
    const provider = strategy.replace('web3_', '').replace('_signature', '') as Web3Provider;

    try {
      card.setLoading(strategy);
      const identifier = await getWeb3Identifier({ provider });

      if (!user) {
        throw new Error('user is not defined');
      }

      let web3Wallet = await user.createWeb3Wallet({ web3Wallet: identifier });
      web3Wallet = await web3Wallet.prepareVerification({ strategy });
      const message = web3Wallet.verification.message as string;
      const signature = await generateWeb3Signature({ identifier, nonce: message, provider });
      await web3Wallet.attemptVerification({ signature });
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

  if (unconnectedStrategies.length === 0) {
    return null;
  }

  return (
    <ProfileSection.ActionMenu
      id='web3Wallets'
      triggerLocalizationKey={localizationKeys('userProfile.start.web3WalletsSection.primaryButton')}
    >
      {unconnectedStrategies.map(strategy => (
        <ProfileSection.ActionMenuItem
          key={strategy}
          id={strategyToDisplayData[strategy].id}
          onClick={() => connect(strategy)}
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
  );
});
