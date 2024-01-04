import { useUser } from '@clerk/shared/react';
import type { OAuthProvider, OAuthStrategy } from '@clerk/types';

import { appendModalState } from '../../../utils';
import { useUserProfileContext } from '../../contexts';
import { Col, Flex, Image, localizationKeys, SimpleButton, Text } from '../../customizables';
import { ArrowBlockButton, Menu, MenuList, MenuTrigger, useCardState, withCardStateProvider } from '../../elements';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { Plus } from '../../icons';
import { useRouter } from '../../router';
import { handleError, sleep } from '../../utils';

export const ConnectedAccountsMenu = withCardStateProvider(() => {
  return <AddConnectedAccount />;
});

const AddConnectedAccount = () => {
  const card = useCardState();
  const { user } = useUser();
  const { navigate } = useRouter();
  const { strategies, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const { additionalOAuthScopes, componentName, mode } = useUserProfileContext();
  const isModal = mode === 'modal';

  const enabledStrategies = strategies.filter(s => s.startsWith('oauth')) as OAuthStrategy[];
  const connectedStrategies = user?.verifiedExternalAccounts.map(a => `oauth_${a.provider}`) as OAuthStrategy[];

  const unconnectedStrategies = enabledStrategies.filter(provider => {
    return !connectedStrategies.includes(provider);
  });

  const connect = (strategy: OAuthStrategy) => {
    const socialProvider = strategy.replace('oauth_', '') as OAuthProvider;
    const redirectUrl = isModal
      ? appendModalState({ url: window.location.href, componentName, socialProvider: socialProvider })
      : window.location.href;
    const additionalScopes = additionalOAuthScopes ? additionalOAuthScopes[socialProvider] : [];

    // TODO: Decide if we should keep using this strategy
    // If yes, refactor and cleanup:
    card.setLoading(strategy);
    user
      ?.createExternalAccount({
        strategy: strategy,
        redirectUrl,
        additionalScopes,
      })
      .then(res => {
        if (res.verification?.externalVerificationRedirectURL) {
          void navigate(res.verification.externalVerificationRedirectURL.href);
        }
      })
      .catch(err => handleError(err, [], card.setError))
      .finally(() => {
        void sleep(2000).then(() => card.setIdle);
      });
  };

  if (unconnectedStrategies.length === 0) {
    return null;
  }

  return (
    <Flex
      sx={{
        position: 'relative',
      }}
    >
      <Menu popoverPlacement='bottom'>
        <MenuTrigger>
          <ArrowBlockButton
            variant='ghost'
            sx={[t => ({ justifyContent: 'start', gap: t.space.$2, padding: `${t.space.$2} ${t.space.$4}` })]}
            textLocalizationKey={localizationKeys('userProfile.start.connectedAccountsSection.primaryButton')}
            leftIcon={Plus}
            leftIconSx={t => ({ width: t.sizes.$2x5, height: t.sizes.$2x5 })}
          />
        </MenuTrigger>
        <MenuList
          sx={{
            width: '100%',
          }}
        >
          <Col
            gap={2}
            sx={t => ({
              paddingLeft: t.space.$1,
              paddingRight: t.space.$1,
            })}
          >
            {unconnectedStrategies.map(strategy => (
              <SimpleButton
                key={strategy}
                id={strategyToDisplayData[strategy].id}
                onClick={() => connect(strategy)}
                isDisabled={card.isLoading}
                variant='ghost'
                sx={t => ({
                  justifyContent: 'start',
                  gap: t.space.$2,
                })}
                focusRing={false}
              >
                <Image
                  isLoading={card.loadingMetadata === strategy}
                  isDisabled={card.isLoading}
                  src={strategyToDisplayData[strategy].iconUrl}
                  alt={`Connect ${strategyToDisplayData[strategy].name} account`}
                  sx={theme => ({ width: theme.sizes.$4 })}
                />
                <Text
                  localizationKey={localizationKeys('userProfile.connectedAccountPage.socialButtonsBlockButton', {
                    provider: strategyToDisplayData[strategy].name,
                  })}
                />
              </SimpleButton>
            ))}
          </Col>
        </MenuList>
      </Menu>
    </Flex>
  );
};
