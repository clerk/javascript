import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { useReverification, useUser } from '@clerk/shared/react';
import type { OAuthProvider, OAuthStrategy } from '@clerk/shared/types';

import { useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { handleError } from '@/ui/utils/errorHandler';
import { sleep } from '@/ui/utils/sleep';

import { ProviderInitialIcon } from '../../common';
import { useUserProfileContext } from '../../contexts';
import { descriptors, Image, localizationKeys } from '../../customizables';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { useRouter } from '../../router';

const ConnectMenuButton = (props: { strategy: OAuthStrategy; onClick?: () => void }) => {
  const { strategy } = props;
  const card = useCardState();
  const { user } = useUser();
  const { navigate } = useRouter();
  const { strategyToDisplayData } = useEnabledThirdPartyProviders();
  const { additionalOAuthScopes, componentName, mode } = useUserProfileContext();
  const isModal = mode === 'modal';

  const createExternalAccount = useReverification(() => {
    const socialProvider = strategy.replace('oauth_', '') as OAuthProvider;
    const redirectUrl = isModal
      ? appendModalState({ url: window.location.href, componentName, socialProvider: socialProvider })
      : window.location.href;
    const additionalScopes = additionalOAuthScopes ? additionalOAuthScopes[socialProvider] : [];

    return user?.createExternalAccount({
      strategy,
      redirectUrl,
      additionalScopes,
    });
  });

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

  const connect = () => {
    if (!user) {
      return;
    }

    // TODO: Decide if we should keep using this strategy
    // If yes, refactor and cleanup:
    card.setLoading(strategy);
    return createExternalAccount()
      .then(res => {
        if (res && res.verification?.externalVerificationRedirectURL) {
          void sleep(2000).then(() => card.setIdle(strategy));
          void navigate(res.verification.externalVerificationRedirectURL.href);
        }
      })
      .catch(err => {
        handleError(err, [], card.setError);
        card.setIdle(strategy);
      });
  };

  return (
    <ProfileSection.ActionMenuItem
      key={strategy}
      id={strategyToDisplayData[strategy].id}
      onClick={connect}
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
};

export const AddConnectedAccount = ({ onClick }: { onClick?: () => void }) => {
  const { user } = useUser();
  const { strategies } = useEnabledThirdPartyProviders();

  const enabledStrategies = strategies.filter(s => s.startsWith('oauth')) as OAuthStrategy[];
  const connectedStrategies = user?.verifiedExternalAccounts.map(a => `oauth_${a.provider}`) as OAuthStrategy[];

  const unconnectedStrategies = enabledStrategies.filter(provider => {
    return !connectedStrategies.includes(provider);
  });

  if (unconnectedStrategies.length === 0) {
    return null;
  }

  return (
    <ProfileSection.ActionMenu
      triggerLocalizationKey={localizationKeys('userProfile.start.connectedAccountsSection.primaryButton')}
      id='connectedAccounts'
      onClick={onClick}
    >
      {unconnectedStrategies.map(strategy => (
        <ConnectMenuButton
          strategy={strategy}
          key={strategy}
        />
      ))}
    </ProfileSection.ActionMenu>
  );
};
