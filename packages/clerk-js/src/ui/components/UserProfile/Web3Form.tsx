import { useUser } from '@clerk/shared/react';
import type { Web3Strategy } from '@clerk/types';

import { generateSignatureWithMetamask, getMetamaskIdentifier } from '../../../utils/web3';
import { useWizard, Wizard } from '../../common';
import { Button, Col, descriptors, Image, localizationKeys, Text } from '../../customizables';
import {
  ArrowBlockButton,
  FormButtonContainer,
  FormContent,
  SuccessPage,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { getFieldError, handleError } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const Web3Form = withCardStateProvider(() => {
  const { close } = useActionContext();

  const wizard = useWizard();

  return (
    <Wizard {...wizard.props}>
      <AddWeb3Wallet nextStep={wizard.nextStep} />
      <SuccessPage
        title={localizationKeys('userProfile.web3WalletPage.title')}
        text={localizationKeys('userProfile.web3WalletPage.successMessage')}
        onFinish={close}
      />
    </Wizard>
  );
});

const AddWeb3Wallet = (props: { nextStep: () => void }) => {
  const { nextStep } = props;
  const card = useCardState();
  const { close } = useActionContext();
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
      nextStep();
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

  return (
    <FormContent
      headerTitle={localizationKeys('userProfile.web3WalletPage.title')}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <Text
        localizationKey={localizationKeys(
          unconnectedStrategies.length
            ? 'userProfile.web3WalletPage.subtitle__availableWallets'
            : 'userProfile.web3WalletPage.subtitle__unavailableWallets',
        )}
      />
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
            leftIcon={
              <Image
                elementDescriptor={descriptors.socialButtonsProviderIcon}
                elementId={descriptors.socialButtonsProviderIcon.setId(strategyToDisplayData[strategy].id)}
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
        <Button
          variant='ghost'
          onClick={close}
          localizationKey={localizationKeys('userProfile.formButtonReset')}
        />
      </FormButtonContainer>
    </FormContent>
  );
};
