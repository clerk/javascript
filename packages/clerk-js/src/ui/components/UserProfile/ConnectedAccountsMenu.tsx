import { useUser } from '@clerk/shared/react';
import type { OAuthProvider, OAuthStrategy } from '@clerk/types';

import { appendModalState } from '../../../utils';
import { ProviderInitialIcon } from '../../common';
import { useUserProfileContext } from '../../contexts';
import { descriptors, Image, localizationKeys } from '../../customizables';
import { ProfileSection, useCardState } from '../../elements';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { useAssurance } from '../../hooks/useAssurance';
import { useRouter } from '../../router';
import { handleError, sleep } from '../../utils';

export const AddConnectedAccount = () => {
  const card = useCardState();
  const { user } = useUser();
  const { navigate } = useRouter();
  const { strategies, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const { additionalOAuthScopes, componentName, mode } = useUserProfileContext();

  const { handleAssurance } = useAssurance();
  const isModal = mode === 'modal';

  const enabledStrategies = strategies.filter(s => s.startsWith('oauth')) as OAuthStrategy[];
  const connectedStrategies = user?.verifiedExternalAccounts.map(a => `oauth_${a.provider}`) as OAuthStrategy[];

  const unconnectedStrategies = enabledStrategies.filter(provider => {
    return !connectedStrategies.includes(provider);
  });

  const connect = (strategy: OAuthStrategy) => {
    if (!user) {
      return;
    }
    const socialProvider = strategy.replace('oauth_', '') as OAuthProvider;
    const redirectUrl = isModal
      ? appendModalState({ url: window.location.href, componentName, socialProvider: socialProvider })
      : window.location.href;
    const additionalScopes = additionalOAuthScopes ? additionalOAuthScopes[socialProvider] : [];

    // TODO: Decide if we should keep using this strategy
    // If yes, refactor and cleanup:
    card.setLoading(strategy);
    return handleAssurance(() =>
      user.createExternalAccount({
        strategy,
        redirectUrl,
        additionalScopes,
      }),
    )
      .then(res => {
        if (res.verification?.externalVerificationRedirectURL) {
          void sleep(2000).then(() => card.setIdle(strategy));
          void navigate(res.verification.externalVerificationRedirectURL.href);
        }
      })
      .catch(err => {
        handleError(err, [], card.setError);
        card.setIdle(strategy);
      });
  };

  if (unconnectedStrategies.length === 0) {
    return null;
  }

  return (
    <ProfileSection.ActionMenu
      triggerLocalizationKey={localizationKeys('userProfile.start.connectedAccountsSection.primaryButton')}
      id='connectedAccounts'
    >
      {unconnectedStrategies.map(strategy => {
        const imageOrInitial = strategyToDisplayData[strategy].iconUrl ? (
          <Image
            isLoading={card.loadingMetadata === strategy}
            isDisabled={card.isLoading}
            elementDescriptor={descriptors.providerIcon}
            elementId={descriptors.providerIcon.setId(strategyToDisplayData[strategy].id)}
            src={strategyToDisplayData[strategy].iconUrl}
            alt={`Connect ${strategyToDisplayData[strategy].name} account`}
            sx={theme => ({ width: theme.sizes.$4 })}
          />
        ) : (
          <ProviderInitialIcon
            id={strategyToDisplayData[strategy].id}
            value={strategyToDisplayData[strategy].name}
            isLoading={card.loadingMetadata === strategy}
            isDisabled={card.isLoading}
          />
        );

        return (
          <ProfileSection.ActionMenuItem
            key={strategy}
            id={strategyToDisplayData[strategy].id}
            onClick={() => connect(strategy)}
            isDisabled={card.isLoading}
            variant='ghost'
            isLoading={card.loadingMetadata === strategy}
            focusRing={false}
            closeAfterClick={false}
            localizationKey={localizationKeys('userProfile.connectedAccountPage.socialButtonsBlockButton', {
              provider: strategyToDisplayData[strategy].name,
            })}
            sx={t => ({
              justifyContent: 'start',
              gap: t.space.$2,
            })}
            leftIcon={imageOrInitial}
          />
        );
      })}
    </ProfileSection.ActionMenu>
  );
};
