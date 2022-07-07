import { Web3Strategy, Web3WalletResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useRouter } from '../../ui/router';
import { generateSignatureWithMetamask, getMetamaskIdentifier } from '../../utils/web3';
import { useWizard, Wizard } from '../common';
import { Col, descriptors, Image, Text } from '../customizables';
import { ArrowBlockButton, useCardState, withCardStateProvider } from '../elements';
import { useEnabledThirdPartyProviders } from '../hooks';
import { getFieldError, handleError } from '../utils';
import { FormButtonContainer } from './FormButtons';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';

export const Web3Page = withCardStateProvider(() => {
  const title = 'Add web3 wallet';
  const user = useCoreUser();

  const { params } = useRouter();
  const { id } = params || {};

  const ref = React.useRef<Web3WalletResource | undefined>(user.web3Wallets.find(a => a.id === id));
  const wizard = useWizard({ defaultStep: ref.current ? 1 : 0 });

  return (
    <Wizard {...wizard.props}>
      <AddWeb3Wallet nextStep={wizard.nextStep} />
      <SuccessPage
        title={title}
        text={`The wallet has been added to your account.`}
      />
    </Wizard>
  );
});

const AddWeb3Wallet = (props: { nextStep: () => void }) => {
  const { nextStep } = props;
  const card = useCardState();
  const user = useCoreUser();
  const { strategyToDisplayData } = useEnabledThirdPartyProviders();

  // TODO: This logic is very similar to AddConnectedAccount but only metamask is supported right now
  // const enabledStrategies = strategies.filter(s => s.startsWith('web3')) as Web3Strategy[];
  // const connectedStrategies = user.web3Wallets.map(w => w.web3Wallet) as OAuthStrategy[];
  const unconnectedStrategies: Web3Strategy[] =
    user.web3Wallets.filter(w => w.verification?.status === 'verified').length === 0 ? ['web3_metamask_signature'] : [];
  console.log(card);
  const connect = async (strategy: Web3Strategy) => {
    // card.setError('hey');
    // return;
    try {
      card.setLoading(strategy);
      const identifier = await getMetamaskIdentifier();
      let web3Wallet = await user.createWeb3Wallet({ web3Wallet: identifier });
      web3Wallet = await web3Wallet.prepareVerification({ strategy: 'web3_metamask_signature' });
      const nonce = web3Wallet.verification.nonce as string;
      const signature = await generateSignatureWithMetamask({ identifier, nonce });
      await web3Wallet.attemptVerification({ signature });
      card.setIdle();
      nextStep();
    } catch (err) {
      card.setIdle();
      console.log(err);
      const fieldError = getFieldError(err);
      if (fieldError) {
        console.log('fieldError', fieldError);
        card.setError(fieldError.longMessage);
      } else {
        console.log('handleError');
        handleError(err, [], card.setError);
      }
    }
  };

  return (
    <ContentPage.Root headerTitle={'Add web3 wallet'}>
      <Text>
        {unconnectedStrategies.length
          ? 'Select a web3 wallet to connect to your account.'
          : 'There are no available web3 wallets.'}
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
                alt={`Connect ${strategyToDisplayData[strategy].name}`}
                sx={theme => ({ width: theme.sizes.$5 })}
              />
            }
          >
            {`Connect ${strategyToDisplayData[strategy].name} wallet`}
          </ArrowBlockButton>
        ))}
      </Col>
      <FormButtonContainer sx={{ marginTop: 0 }}>
        <NavigateToFlowStartButton>Cancel</NavigateToFlowStartButton>
      </FormButtonContainer>
    </ContentPage.Root>
  );
};
