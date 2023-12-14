import { useUser } from '@clerk/shared/react';
import React from 'react';

import { RemoveResourcePage } from '../../common';
import { localizationKeys } from '../../customizables';
import { useEnabledThirdPartyProviders } from '../../hooks';
import { useRouter } from '../../router';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

type RemoveEmailFormProps = {
  emailId: string;
};

export const RemoveEmailForm = (props: RemoveEmailFormProps) => {
  const { user } = useUser();
  const { emailId: id } = props;
  const resource = user?.emailAddresses.find(e => e.id === id);
  const ref = React.useRef(resource?.emailAddress);

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.emailAddressPage.removeResource.title')}
      messageLine1={localizationKeys('userProfile.emailAddressPage.removeResource.messageLine1', {
        identifier: ref.current,
      })}
      messageLine2={localizationKeys('userProfile.emailAddressPage.removeResource.messageLine2')}
      successMessage={localizationKeys('userProfile.emailAddressPage.removeResource.successMessage', {
        emailAddress: ref.current,
      })}
      deleteResource={() => Promise.resolve(resource?.destroy())}
      Breadcrumbs={UserProfileBreadcrumbs}
    />
  );
};

type RemovePhoneFormProps = {
  phoneId: string;
};

export const RemovePhoneForm = (props: RemovePhoneFormProps) => {
  const { phoneId: id } = props;
  const { user } = useUser();
  const resource = user?.phoneNumbers.find(e => e.id === id);
  const ref = React.useRef(resource?.phoneNumber);

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.phoneNumberPage.removeResource.title')}
      messageLine1={localizationKeys('userProfile.phoneNumberPage.removeResource.messageLine1', {
        identifier: ref.current,
      })}
      messageLine2={localizationKeys('userProfile.phoneNumberPage.removeResource.messageLine2')}
      successMessage={localizationKeys('userProfile.phoneNumberPage.removeResource.successMessage', {
        phoneNumber: ref.current,
      })}
      deleteResource={() => Promise.resolve(resource?.destroy())}
      Breadcrumbs={UserProfileBreadcrumbs}
    />
  );
};

export const RemoveConnectedAccountPage = () => {
  const { user } = useUser();
  const { id } = useRouter().params;
  const resource = user?.externalAccounts.find(e => e.id === id);
  const ref = React.useRef(resource?.provider);
  const { providerToDisplayData } = useEnabledThirdPartyProviders();

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.connectedAccountPage.removeResource.title')}
      messageLine1={localizationKeys('userProfile.connectedAccountPage.removeResource.messageLine1', {
        identifier: providerToDisplayData[ref.current]?.name,
      })}
      messageLine2={localizationKeys('userProfile.connectedAccountPage.removeResource.messageLine2')}
      successMessage={localizationKeys('userProfile.connectedAccountPage.removeResource.successMessage', {
        connectedAccount: providerToDisplayData[ref.current]?.name,
      })}
      deleteResource={() => Promise.resolve(resource?.destroy())}
      Breadcrumbs={UserProfileBreadcrumbs}
    />
  );
};

export const RemoveWeb3WalletPage = () => {
  const { user } = useUser();
  const { id } = useRouter().params;
  const resource = user?.web3Wallets.find(e => e.id === id);
  const ref = React.useRef(resource?.web3Wallet);

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.web3WalletPage.removeResource.title')}
      messageLine1={localizationKeys('userProfile.web3WalletPage.removeResource.messageLine1', {
        identifier: ref.current,
      })}
      messageLine2={localizationKeys('userProfile.web3WalletPage.removeResource.messageLine2')}
      successMessage={localizationKeys('userProfile.web3WalletPage.removeResource.successMessage', {
        web3Wallet: ref.current,
      })}
      deleteResource={() => Promise.resolve(resource?.destroy())}
      Breadcrumbs={UserProfileBreadcrumbs}
    />
  );
};

export const RemoveMfaPhoneCodePage = () => {
  const { user } = useUser();
  const { id } = useRouter().params;
  // TODO: This logic will need to change when we add more 2fa methods
  const resource = user?.phoneNumbers.find(e => e.id === id);
  const ref = React.useRef(resource?.phoneNumber);

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.mfaPhoneCodePage.removeResource.title')}
      messageLine1={localizationKeys('userProfile.mfaPhoneCodePage.removeResource.messageLine1', {
        identifier: ref.current,
      })}
      messageLine2={localizationKeys('userProfile.mfaPhoneCodePage.removeResource.messageLine2')}
      successMessage={localizationKeys('userProfile.mfaPhoneCodePage.removeResource.successMessage', {
        mfaPhoneCode: ref.current,
      })}
      deleteResource={() => Promise.resolve(resource?.setReservedForSecondFactor({ reserved: false }))}
      Breadcrumbs={UserProfileBreadcrumbs}
    />
  );
};

export const RemoveMfaTOTPPage = () => {
  const { user } = useUser();
  return (
    <RemoveResourcePage
      title={localizationKeys('userProfile.mfaTOTPPage.removeResource.title')}
      messageLine1={localizationKeys('userProfile.mfaTOTPPage.removeResource.messageLine1')}
      messageLine2={localizationKeys('userProfile.mfaTOTPPage.removeResource.messageLine2')}
      successMessage={localizationKeys('userProfile.mfaTOTPPage.removeResource.successMessage')}
      deleteResource={user!.disableTOTP}
      Breadcrumbs={UserProfileBreadcrumbs}
    />
  );
};
