import type { ExternalAccountResource, OAuthStrategy } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreUser } from '../../contexts';
import { Col, Image, localizationKeys, Text } from '../../customizables';
import {
  ArrowBlockButton,
  ContentPage,
  FormButtonContainer,
  NavigateToFlowStartButton,
  SuccessPage,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useEnabledThirdPartyProviders, useNavigate } from '../../hooks';
import { useRouter } from '../../router';
import { handleError, sleep } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const ConnectedAccountsPage = withCardStateProvider(() => {
  const title = localizationKeys('userProfile.connectedAccountPage.title');
  const user = useCoreUser();

  const { params } = useRouter();
  const { id } = params || {};

  const ref = React.useRef<ExternalAccountResource | undefined>(user.externalAccounts.find(a => a.id === id));
  const wizard = useWizard({ defaultStep: ref.current ? 1 : 0 });

  // TODO: Better handling of success redirect
  return (
    <Wizard {...wizard.props}>
      <AddConnectedAccount />
      <SuccessPage
        title={title}
        text={localizationKeys('userProfile.connectedAccountPage.successMessage')}
        Breadcrumbs={UserProfileBreadcrumbs}
      />
    </Wizard>
  );
});

const AddConnectedAccount = () => {
  const card = useCardState();
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const { strategies, strategyToDisplayData } = useEnabledThirdPartyProviders();

  const enabledStrategies = strategies.filter(s => s.startsWith('oauth')) as OAuthStrategy[];
  const connectedStrategies = user.verifiedExternalAccounts.map(a => 'oauth_' + a.provider) as OAuthStrategy[];

  const unconnectedStrategies = enabledStrategies.filter(provider => {
    return !connectedStrategies.includes(provider);
  });

  const connect = (strategy: OAuthStrategy) => {
    // TODO: Decide if we should keep using this strategy
    // If yes, refactor and cleanup:
    card.setLoading(strategy);
    user
      .createExternalAccount({ strategy: strategy, redirect_url: window.location.href })
      .then(res => {
        if (res.verification?.externalVerificationRedirectURL) {
          return navigate(res.verification.externalVerificationRedirectURL);
        }
      })
      .catch(err => handleError(err, [], card.setError))
      .finally(() => {
        void sleep(2000).then(() => card.setIdle);
      });
  };

  return (
    <ContentPage headerTitle={localizationKeys('userProfile.connectedAccountPage.title')}>
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
            icon={
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
        <NavigateToFlowStartButton localizationKey={localizationKeys('userProfile.formButtonReset')} />
      </FormButtonContainer>
    </ContentPage>
  );
};
