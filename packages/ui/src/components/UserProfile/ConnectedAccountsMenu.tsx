import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { useReverification, useUser } from '@clerk/shared/react';
import type { OAuthProvider, OAuthStrategy } from '@clerk/shared/types';
import { useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { MagnifyingGlass } from '@/ui/icons';
import { handleError } from '@/ui/utils/errorHandler';
import { sleep } from '@/ui/utils/sleep';

import { ProviderIcon } from '../../common';
import { useUserProfileContext } from '../../contexts';
import { Box, descriptors, Flex, Icon, Input, localizationKeys, Text } from '../../customizables';
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
      leftIcon={
        <ProviderIcon
          id={strategyToDisplayData[strategy].id}
          iconUrl={strategyToDisplayData[strategy].iconUrl}
          name={strategyToDisplayData[strategy].name}
          isLoading={card.loadingMetadata === strategy}
          isDisabled={card.isLoading}
          alt={`Connect ${strategyToDisplayData[strategy].name} account`}
          elementDescriptor={descriptors.providerIcon}
          elementId={descriptors.providerIcon.setId(strategyToDisplayData[strategy].id)}
        />
      }
    />
  );
};

export const AddConnectedAccount = ({ onClick }: { onClick?: () => void }) => {
  const { user } = useUser();
  const { strategies, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const [searchTerm, setSearchTerm] = useState('');

  const enabledStrategies = strategies.filter(s => s.startsWith('oauth')) as OAuthStrategy[];
  const connectedStrategies = user?.verifiedExternalAccounts.map(a => `oauth_${a.provider}`) as OAuthStrategy[];

  const unconnectedStrategies = enabledStrategies.filter(provider => {
    return !connectedStrategies.includes(provider);
  });
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredStrategies = unconnectedStrategies.filter(strategy => {
    const provider = strategy.replace('oauth_', '');
    const displayData = strategyToDisplayData[strategy];
    return `${displayData.name} ${displayData.id} ${provider}`.toLowerCase().includes(normalizedSearchTerm);
  });

  if (unconnectedStrategies.length === 0) {
    return null;
  }

  return (
    <ProfileSection.ActionMenu
      triggerLocalizationKey={localizationKeys('userProfile.start.connectedAccountsSection.primaryButton')}
      id='connectedAccounts'
      onClick={onClick}
      popoverShouldFlip={false}
      menuSx={{ transformOrigin: 'top center' }}
    >
      {unconnectedStrategies.length > 1 && (
        <Flex sx={t => ({ padding: t.space.$0x5 })}>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
              sx={t => ({
                position: 'absolute',
                insetInlineStart: t.space.$2x5,
                top: '50%',
                width: t.sizes.$3x5,
                height: t.sizes.$3x5,
                pointerEvents: 'none',
                transform: 'translateY(-50%)',
              })}
            >
              <Icon
                icon={MagnifyingGlass}
                sx={t => ({
                  color: t.colors.$colorMutedForeground,
                  width: '100%',
                  height: '100%',
                })}
              />
            </Box>
            <Input
              aria-label='Search connected account providers'
              type='search'
              autoCapitalize='none'
              spellCheck={false}
              value={searchTerm}
              placeholder='Search providers'
              focusRing={false}
              variant='unstyled'
              onChange={e => setSearchTerm(e.target.value)}
              sx={t => ({
                width: '100%',
                borderRadius: t.radii.$md,
                backgroundColor: t.colors.$neutralAlpha100,
                paddingBlock: t.space.$2,
                paddingInlineStart: t.space.$7x5,
                paddingInlineEnd: t.space.$2,
              })}
            />
          </Box>
        </Flex>
      )}
      {filteredStrategies.map(strategy => (
        <ConnectMenuButton
          strategy={strategy}
          key={strategy}
        />
      ))}
      {filteredStrategies.length === 0 && (
        <Text
          colorScheme='secondary'
          sx={t => ({
            padding: `${t.space.$2} ${t.space.$2x5}`,
            textAlign: 'center',
          })}
        >
          No providers found
        </Text>
      )}
    </ProfileSection.ActionMenu>
  );
};
