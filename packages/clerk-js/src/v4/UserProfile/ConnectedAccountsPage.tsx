import { ExternalAccountResource, OAuthStrategy } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { useRouter } from '../../ui/router';
import { useWizard, Wizard } from '../common';
import { Col, descriptors, Image, Text } from '../customizables';
import { ArrowBlockButton, useCardState, withCardStateProvider } from '../elements';
import { useEnabledThirdPartyProviders } from '../hooks';
import { handleError, sleep } from '../utils';
import { FormButtonContainer } from './FormButtons';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';

export const ConnectedAccountsPage = withCardStateProvider(() => {
  const title = 'Add connected account';
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
        text={`has been added to your account.`}
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
    // const redirectUrl = stateParam.add(window.location.href, {
    //   c: 'userProfile',
    //   la: 'createExternalAccount',
    //   lam: { strategy },
    // });
    user
      // .createExternalAccount({ strategy: strategy, redirect_url: redirectUrl.toString() })
      .createExternalAccount({ strategy: strategy, redirect_url: window.location.href })
      .then(res => {
        return navigate(res.verification!.externalVerificationRedirectURL);
      })
      .catch(err => handleError(err, [], card.setError))
      .finally(() => {
        void sleep(2000).then(() => card.setIdle);
      });
  };

  return (
    <ContentPage.Root headerTitle={'Add connected account'}>
      <Text>
        {unconnectedStrategies.length
          ? 'Select a provider to connect your account.'
          : 'There are no available external account providers.'}
      </Text>
      <Col gap={2}>
        {unconnectedStrategies.map(strategy => (
          <ArrowBlockButton
            // elementDescriptor={descriptors.socialButtonsButtonBlock}
            // elementId={descriptors.socialButtonsButtonBlock.setId(strategy)}
            // textElementDescriptor={descriptors.socialButtonsButtonBlockText}
            // textElementId={descriptors.socialButtonsButtonBlockText.setId(strategy)}
            // arrowElementDescriptor={descriptors.socialButtonsButtonBlockArrow}
            // arrowElementId={descriptors.socialButtonsButtonBlockArrow.setId(strategy)}
            key={strategy}
            id={strategyToDisplayData[strategy].id}
            onClick={() => connect(strategy)}
            isLoading={card.loadingMetadata === strategy}
            isDisabled={card.isLoading}
            icon={
              <Image
                elementDescriptor={descriptors.socialButtonsLogo}
                elementId={descriptors.socialButtonsLogo.setId(strategyToDisplayData[strategy].id)}
                isLoading={card.loadingMetadata === strategy}
                isDisabled={card.isLoading}
                src={strategyToDisplayData[strategy].iconUrl}
                alt={`Connect ${strategyToDisplayData[strategy].name} account`}
                sx={theme => ({ width: theme.sizes.$5 })}
              />
            }
          >
            {`Connect ${strategyToDisplayData[strategy].name} account`}
          </ArrowBlockButton>
        ))}
      </Col>
      <FormButtonContainer sx={{ marginTop: 0 }}>
        <NavigateToFlowStartButton>Cancel</NavigateToFlowStartButton>
      </FormButtonContainer>
    </ContentPage.Root>
  );
};
