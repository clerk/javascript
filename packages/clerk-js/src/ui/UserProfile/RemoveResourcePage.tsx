import React from 'react';

import { useWizard, Wizard } from '../common';
import { useCoreUser } from '../contexts';
import { Text } from '../customizables';
import { Form } from '../elements';
import { useEnabledThirdPartyProviders } from '../hooks';
import { useRouter } from '../router';
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
      title='Remove email address'
      messageLine1={`${ref.current.emailAddress} will be removed from this account.`}
      messageLine2={'You will no longer be able to sign in using this email address.'}
      successMessage={`${ref.current.emailAddress} has been removed from your account.`}
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
      title='Remove email address'
      messageLine1={`${ref.current.phoneNumber} will be removed from this account.`}
      messageLine2={`You will no longer be able to sign in using this phone number.`}
      successMessage={`${ref.current.phoneNumber} has been removed from your account.`}
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
      title='Remove connected account'
      messageLine1={`${providerToDisplayData[ref.current.provider]?.name} will be removed from this account.`}
      messageLine2={`You will no longer be able to sign in using this connected account.`}
      successMessage={`${providerToDisplayData[ref.current.provider]?.name} has been removed from your account.`}
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
      title='Remove web3 wallet'
      messageLine1={`${ref.current.web3Wallet} will be removed from this account.`}
      messageLine2={`You will no longer be able to sign in using this web3 wallet.`}
      successMessage={`${ref.current.web3Wallet} has been removed from your account.`}
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
      title='Remove two-step verification'
      messageLine1={`${ref.current.phoneNumber} will be no longer receive verification codes when signing in.`}
      messageLine2={`Your account may not be as secure. Are you sure you want to continue?`}
      successMessage={`SMS code two-step verification has been removed for ${ref.current.phoneNumber}.`}
      deleteResource={() => Promise.resolve(ref.current?.setReservedForSecondFactor({ reserved: false }))}
    />
  );
};

export const RemoveMfaTOTPPage = () => {
  const user = useCoreUser();

  return (
    <RemoveResourcePage
      title='Remove two-step verification'
      messageLine1='Verification codes from this authenticator will no longer be required when signing in.'
      messageLine2='Your account may not be as secure. Are you sure you want to continue?'
      successMessage='Two-step verification via authenticator application has been removed.'
      deleteResource={user.disableTOTP}
    />
  );
};

type RemovePageProps = {
  title: string;
  messageLine1: string;
  messageLine2: string;
  successMessage: string;
  deleteResource: () => Promise<any>;
};

const RemoveResourcePage = (props: RemovePageProps) => {
  const { title, messageLine1, messageLine2, successMessage, deleteResource } = props;
  const wizard = useWizard();
  return (
    <Wizard {...wizard.props}>
      <ContentPage.Root headerTitle={title}>
        <Form.Root onSubmit={() => deleteResource().then(() => wizard.nextStep())}>
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
};
