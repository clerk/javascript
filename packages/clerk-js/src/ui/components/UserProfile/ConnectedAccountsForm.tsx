import { useUser } from '@clerk/shared/react';
import type { OAuthProvider, OAuthStrategy } from '@clerk/types';

import { appendModalState } from '../../../utils';
import { useUserProfileContext } from '../../contexts';
import { Button, Col, Image, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import {
  ArrowBlockButton,
  FormButtonContainer,
  FormContent,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { useRouter } from '../../router';
import { handleError, sleep } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

type ConnectedAccountsFormProps = FormProps;

export const ConnectedAccountsForm = withCardStateProvider((props: ConnectedAccountsFormProps) => {
  const { onSuccess, onReset } = props;
  return (
    <AddConnectedAccount
      onSuccess={onSuccess}
      onReset={onReset}
    />
  );
});

type AddConnectedAccountProps = FormProps;
const AddConnectedAccount = (props: AddConnectedAccountProps) => {
  const { onReset } = props;
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

  return (
    <FormContent
      headerTitle={localizationKeys('userProfile.connectedAccountPage.title')}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <Text
        localizationKey={
          unconnectedStrategies.length
            ? localizationKeys('userProfile.connectedAccountPage.formHint')
            : localizationKeys('userProfile.connectedAccountPage.formHint__noAccounts')
        }
      />
      <Col gap={2}>
        {unconnectedStrategies.map(strategy => (
          <ArrowBlockButton
            key={strategy}
            id={strategyToDisplayData[strategy].id}
            onClick={() => connect(strategy)}
            isLoading={card.loadingMetadata === strategy}
            isDisabled={card.isLoading}
            leftIcon={
              <Image
                isLoading={card.loadingMetadata === strategy}
                isDisabled={card.isLoading}
                src={strategyToDisplayData[strategy].iconUrl}
                alt={`Connect ${strategyToDisplayData[strategy].name} account`}
                sx={theme => ({ width: theme.sizes.$5 })}
              />
            }
            textLocalizationKey={localizationKeys('userProfile.connectedAccountPage.socialButtonsBlockButton', {
              provider: strategyToDisplayData[strategy].name,
            })}
          />
        ))}
      </Col>
      <FormButtonContainer sx={{ marginTop: 0 }}>
        <Button
          variant='ghost'
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          onClick={onReset}
        />
      </FormButtonContainer>
    </FormContent>
  );
};
