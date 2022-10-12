import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreUser } from '../../contexts';
import { LocalizationKey, localizationKeys, Text } from '../../customizables';
import { Form, useCardState, withCardStateProvider } from '../../elements';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { useRouter } from '../../router';
import { handleError } from '../../utils';
import { FormButtons } from './FormButtons';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';

export const RemoveEmailPage = () => {
  const user = useCoreUser();
  const { id } = useRouter().params;
  const ref = React.useRef(user.emailAddresses.find(e => e.id === id));

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.emailAddressPage.removeResource.title')}
      messageLine1={`${ref.current.emailAddress} will be removed from this account.`}
      messageLine2={'You will no longer be able to sign in using this email address.'}
      successMessage={localizationKeys('userProfile.emailAddressPage.removeResource.successMessage', {
        emailAddress: ref.current.emailAddress,
      })}
      deleteResource={() => Promise.resolve(ref.current?.destroy())}
    />
  );
};

export const RemovePhonePage = () => {
  const user = useCoreUser();
  const { id } = useRouter().params;
  const ref = React.useRef(user.phoneNumbers.find(e => e.id === id));

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.phoneNumberPage.removeResource.title')}
      messageLine1={`${ref.current.phoneNumber} will be removed from this account.`}
      messageLine2={`You will no longer be able to sign in using this phone number.`}
      successMessage={localizationKeys('userProfile.phoneNumberPage.removeResource.successMessage', {
        phoneNumber: ref.current.phoneNumber,
      })}
      deleteResource={() => Promise.resolve(ref.current?.destroy())}
    />
  );
};

export const RemoveConnectedAccountPage = () => {
  const user = useCoreUser();
  const { id } = useRouter().params;
  const ref = React.useRef(user.externalAccounts.find(e => e.id === id));
  const { providerToDisplayData } = useEnabledThirdPartyProviders();

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.connectedAccountPage.removeResource.title')}
      messageLine1={`${providerToDisplayData[ref.current.provider]?.name} will be removed from this account.`}
      messageLine2={`You will no longer be able to sign in using this connected account.`}
      successMessage={localizationKeys('userProfile.connectedAccountPage.removeResource.successMessage', {
        connectedAccount: providerToDisplayData[ref.current.provider]?.name,
      })}
      deleteResource={() => Promise.resolve(ref.current?.destroy())}
    />
  );
};

export const RemoveWeb3WalletPage = () => {
  const user = useCoreUser();
  const { id } = useRouter().params;
  const ref = React.useRef(user.web3Wallets.find(e => e.id === id));

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.web3WalletPage.removeResource.title')}
      messageLine1={`${ref.current.web3Wallet} will be removed from this account.`}
      messageLine2={`You will no longer be able to sign in using this web3 wallet.`}
      successMessage={localizationKeys('userProfile.web3WalletPage.removeResource.successMessage', {
        web3Wallet: ref.current.web3Wallet,
      })}
      deleteResource={() => Promise.resolve(ref.current?.destroy())}
    />
  );
};

export const RemoveMfaPhoneCodePage = () => {
  const user = useCoreUser();
  const { id } = useRouter().params;
  // TODO: This logic will need to change when we add more 2fa methods
  const ref = React.useRef(user.phoneNumbers.find(e => e.id === id));

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.mfaPhoneCodePage.removeResource.title')}
      messageLine1={`${ref.current.phoneNumber} will be no longer receive verification codes when signing in.`}
      messageLine2={`Your account may not be as secure. Are you sure you want to continue?`}
      successMessage={localizationKeys('userProfile.mfaPhoneCodePage.removeResource.successMessage', {
        mfaPhoneCode: ref.current.phoneNumber,
      })}
      deleteResource={() => Promise.resolve(ref.current?.setReservedForSecondFactor({ reserved: false }))}
    />
  );
};

export const RemoveMfaTOTPPage = () => {
  const user = useCoreUser();

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.mfaTOTPPage.removeResource.title')}
      messageLine1='Verification codes from this authenticator will no longer be required when signing in.'
      messageLine2='Your account may not be as secure. Are you sure you want to continue?'
      successMessage={localizationKeys('userProfile.mfaTOTPPage.removeResource.successMessage')}
      deleteResource={user.disableTOTP}
    />
  );
};

type RemovePageProps = {
  title: LocalizationKey;
  messageLine1: string;
  messageLine2: string;
  successMessage: LocalizationKey;
  deleteResource: () => Promise<any>;
};

const RemoveResourcePage = withCardStateProvider((props: RemovePageProps) => {
  const { title, messageLine1, messageLine2, successMessage, deleteResource } = props;
  const wizard = useWizard();
  const card = useCardState();

  const handleSubmit = async () => {
    try {
      await deleteResource().then(() => wizard.nextStep());
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage.Root headerTitle={title}>
        <Form.Root onSubmit={handleSubmit}>
          <Text variant='regularRegular'>{messageLine1}</Text>
          <Text variant='regularRegular'>{messageLine2}</Text>
          <FormButtons colorScheme={'danger'} />
        </Form.Root>
      </ContentPage.Root>

      <SuccessPage
        title={title}
        text={successMessage}
      />
    </Wizard>
  );
});
