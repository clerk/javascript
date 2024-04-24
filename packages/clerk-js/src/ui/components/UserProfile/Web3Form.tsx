import { useUser } from '@clerk/shared/react';
import type { Web3Strategy } from '@clerk/types';

import { generateSignatureWithMetamask, getMetamaskIdentifier } from '../../../utils/web3';
import { descriptors, Image, localizationKeys } from '../../customizables';
import { ProfileSection, useCardState, withCardStateProvider } from '../../elements';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { getFieldError, handleError } from '../../utils';

export const AddWeb3WalletActionMenu = withCardStateProvider(() => {
  const card = useCardState();
  const { user } = useUser();
  const { strategyToDisplayData } = useEnabledThirdPartyProviders();

  // TODO: This logic is very similar to AddConnectedAccount but only metamask is supported right now
  // const enabledStrategies = strategies.filter(s => s.startsWith('web3')) as Web3Strategy[];
  // const connectedStrategies = user.web3Wallets.map(w => w.web3Wallet) as OAuthStrategy[];
  const unconnectedStrategies: Web3Strategy[] =
    user?.web3Wallets.filter(w => w.verification?.status === 'verified').length === 0
      ? ['web3_metamask_signature']
      : [];
  const connect = async (strategy: Web3Strategy) => {
    try {
      card.setLoading(strategy);
      const identifier = await getMetamaskIdentifier();

      if (!user) {
        throw new Error('user is not defined');
      }

      let web3Wallet = await user.createWeb3Wallet({ web3Wallet: identifier });
      web3Wallet = await web3Wallet.prepareVerification({ strategy: 'web3_metamask_signature' });
      const nonce = web3Wallet.verification.nonce as string;
      const signature = await generateSignatureWithMetamask({ identifier, nonce });
      await web3Wallet.attemptVerification({ signature });
      card.setIdle();
    } catch (err) {
      card.setIdle();
      console.log(err);
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
          localizationKey={`Connect ${strategyToDisplayData[strategy].name} wallet`}
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
