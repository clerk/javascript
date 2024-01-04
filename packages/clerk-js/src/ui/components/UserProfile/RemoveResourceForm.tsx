import { useUser } from '@clerk/shared/react';
import React from 'react';

import { RemoveResourceForm } from '../../common';
import { localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { useEnabledThirdPartyProviders } from '../../hooks';

type RemoveEmailFormProps = FormProps & {
  emailId: string;
};

export const RemoveEmailForm = (props: RemoveEmailFormProps) => {
  const { onSuccess, onReset } = props;
  const { user } = useUser();
  const { emailId: id } = props;
  const resource = user?.emailAddresses.find(e => e.id === id);
  const ref = React.useRef(resource?.emailAddress);

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourceForm
      title={localizationKeys('userProfile.profile.emailAddressesSection.emailAddressScreen.removeResource.title')}
      messageLine1={localizationKeys(
        'userProfile.profile.emailAddressesSection.emailAddressScreen.removeResource.messageLine1',
        {
          identifier: ref.current,
        },
      )}
      messageLine2={localizationKeys(
        'userProfile.profile.emailAddressesSection.emailAddressScreen.removeResource.messageLine2',
      )}
      successMessage={localizationKeys(
        'userProfile.profile.emailAddressesSection.emailAddressScreen.removeResource.successMessage',
        {
          emailAddress: ref.current,
        },
      )}
      deleteResource={() => Promise.resolve(resource?.destroy())}
      onSuccess={onSuccess}
      onReset={onReset}
    />
  );
};

type RemovePhoneFormProps = FormProps & {
  phoneId: string;
};

export const RemovePhoneForm = (props: RemovePhoneFormProps) => {
  const { phoneId: id, onSuccess, onReset } = props;
  const { user } = useUser();
  const resource = user?.phoneNumbers.find(e => e.id === id);
  const ref = React.useRef(resource?.phoneNumber);

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourceForm
      title={localizationKeys('userProfile.profile.phoneNumbersSection.phoneNumberScreen.removeResource.title')}
      messageLine1={localizationKeys(
        'userProfile.profile.phoneNumbersSection.phoneNumberScreen.removeResource.messageLine1',
        {
          identifier: ref.current,
        },
      )}
      messageLine2={localizationKeys(
        'userProfile.profile.phoneNumbersSection.phoneNumberScreen.removeResource.messageLine2',
      )}
      successMessage={localizationKeys(
        'userProfile.profile.phoneNumbersSection.phoneNumberScreen.removeResource.successMessage',
        {
          phoneNumber: ref.current,
        },
      )}
      deleteResource={() => Promise.resolve(resource?.destroy())}
      onSuccess={onSuccess}
      onReset={onReset}
    />
  );
};

type ConnectedAccountFormProps = FormProps & {
  accountId: string;
};

export const RemoveConnectedAccountForm = (props: ConnectedAccountFormProps) => {
  const { accountId: id, onSuccess, onReset } = props;
  const { user } = useUser();
  const resource = user?.externalAccounts.find(e => e.id === id);
  const ref = React.useRef(resource?.provider);
  const { providerToDisplayData } = useEnabledThirdPartyProviders();

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourceForm
      title={localizationKeys(
        'userProfile.profile.connectedAccountsSection.connectedAccountScreen.removeResource.title',
      )}
      messageLine1={localizationKeys(
        'userProfile.profile.connectedAccountsSection.connectedAccountScreen.removeResource.messageLine1',
        {
          identifier: providerToDisplayData[ref.current]?.name,
        },
      )}
      messageLine2={localizationKeys(
        'userProfile.profile.connectedAccountsSection.connectedAccountScreen.removeResource.messageLine2',
      )}
      successMessage={localizationKeys(
        'userProfile.profile.connectedAccountsSection.connectedAccountScreen.removeResource.successMessage',
        {
          connectedAccount: providerToDisplayData[ref.current]?.name,
        },
      )}
      deleteResource={() => Promise.resolve(resource?.destroy())}
      onSuccess={onSuccess}
      onReset={onReset}
    />
  );
};

type RemoveWeb3WalletFormProps = FormProps & {
  walletId: string;
};

export const RemoveWeb3WalletForm = (props: RemoveWeb3WalletFormProps) => {
  const { user } = useUser();
  const { walletId: id, onSuccess, onReset } = props;
  const resource = user?.web3Wallets.find(e => e.id === id);
  const ref = React.useRef(resource?.web3Wallet);

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourceForm
      title={localizationKeys('userProfile.profile.web3WalletsSection.web3WalletScreen.removeResource.title')}
      messageLine1={localizationKeys(
        'userProfile.profile.web3WalletsSection.web3WalletScreen.removeResource.messageLine1',
        {
          identifier: ref.current,
        },
      )}
      messageLine2={localizationKeys(
        'userProfile.profile.web3WalletsSection.web3WalletScreen.removeResource.messageLine2',
      )}
      successMessage={localizationKeys(
        'userProfile.profile.web3WalletsSection.web3WalletScreen.removeResource.successMessage',
        {
          web3Wallet: ref.current,
        },
      )}
      deleteResource={() => Promise.resolve(resource?.destroy())}
      onSuccess={onSuccess}
      onReset={onReset}
    />
  );
};

type RemoveMfaPhoneCodeFormProps = FormProps & {
  phoneId: string;
};

export const RemoveMfaPhoneCodeForm = (props: RemoveMfaPhoneCodeFormProps) => {
  const { user } = useUser();
  const { phoneId: id, onSuccess, onReset } = props;
  // TODO: This logic will need to change when we add more 2fa methods
  const resource = user?.phoneNumbers.find(e => e.id === id);
  const ref = React.useRef(resource?.phoneNumber);

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourceForm
      title={localizationKeys('userProfile.security.mfaSection.mfaPhoneCodeScreen.removeResource.title')}
      messageLine1={localizationKeys('userProfile.security.mfaSection.mfaPhoneCodeScreen.removeResource.messageLine1', {
        identifier: ref.current,
      })}
      messageLine2={localizationKeys('userProfile.security.mfaSection.mfaPhoneCodeScreen.removeResource.messageLine2')}
      successMessage={localizationKeys(
        'userProfile.security.mfaSection.mfaPhoneCodeScreen.removeResource.successMessage',
        {
          mfaPhoneCode: ref.current,
        },
      )}
      deleteResource={() => Promise.resolve(resource?.setReservedForSecondFactor({ reserved: false }))}
      onSuccess={onSuccess}
      onReset={onReset}
    />
  );
};

type RemoveMfaTOTPFormProps = FormProps;
export const RemoveMfaTOTPForm = (props: RemoveMfaTOTPFormProps) => {
  const { onSuccess, onReset } = props;
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <RemoveResourceForm
      title={localizationKeys('userProfile.security.mfaSection.mfaTOTPScreen.removeResource.title')}
      messageLine1={localizationKeys('userProfile.security.mfaSection.mfaTOTPScreen.removeResource.messageLine1')}
      messageLine2={localizationKeys('userProfile.security.mfaSection.mfaTOTPScreen.removeResource.messageLine2')}
      successMessage={localizationKeys('userProfile.security.mfaSection.mfaTOTPScreen.removeResource.successMessage')}
      deleteResource={user.disableTOTP}
      onSuccess={onSuccess}
      onReset={onReset}
    />
  );
};
