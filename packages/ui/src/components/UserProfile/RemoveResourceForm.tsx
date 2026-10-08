import { RemoveResourceForm } from '@/ui/common';

import { getRemoveResourceController } from './remove-resource.controller';
import type {
  RemoveConnectedAccountFormProps,
  RemoveEmailFormProps,
  RemoveMfaPhoneCodeFormProps,
  RemoveMfaTOTPFormProps,
  RemovePasskeyFormProps,
  RemovePhoneFormProps,
  RemoveWeb3WalletFormProps,
} from './remove-resource.model';
import {
  useRemoveConnectedAccountModel,
  useRemoveEmailModel,
  useRemoveMfaPhoneCodeModel,
  useRemoveMfaTOTPModel,
  useRemovePasskeyModel,
  useRemovePhoneModel,
  useRemoveWeb3WalletModel,
} from './remove-resource.model';

export const RemoveEmailForm = (props: RemoveEmailFormProps) => {
  const model = useRemoveEmailModel(props.emailId);
  if (!model.identifier) {
    return null;
  }

  return (
    <RemoveResourceForm
      key={model.requestKey}
      {...getRemoveResourceController('email', model.identifier, model.verified, model.deleteResource, props)}
    />
  );
};

export const RemovePhoneForm = (props: RemovePhoneFormProps) => {
  const model = useRemovePhoneModel(props.phoneId);
  if (!model.identifier) {
    return null;
  }

  return (
    <RemoveResourceForm
      key={model.requestKey}
      {...getRemoveResourceController('phone', model.identifier, model.verified, model.deleteResource, props)}
    />
  );
};

export const RemoveConnectedAccountForm = (props: RemoveConnectedAccountFormProps) => {
  const model = useRemoveConnectedAccountModel(props.accountId);
  if (!model.exists) {
    return null;
  }

  return (
    <RemoveResourceForm
      key={model.requestKey}
      {...getRemoveResourceController('connectedAccount', model.name, false, model.deleteResource, props)}
    />
  );
};

export const RemoveWeb3WalletForm = (props: RemoveWeb3WalletFormProps) => {
  const model = useRemoveWeb3WalletModel(props.walletId);
  if (!model.identifier) {
    return null;
  }

  return (
    <RemoveResourceForm
      key={model.requestKey}
      {...getRemoveResourceController('web3Wallet', model.identifier, model.verified, model.deleteResource, props)}
    />
  );
};

export const RemoveMfaPhoneCodeForm = (props: RemoveMfaPhoneCodeFormProps) => {
  const model = useRemoveMfaPhoneCodeModel(props.phoneId);
  if (!model.identifier) {
    return null;
  }

  return (
    <RemoveResourceForm
      key={model.requestKey}
      {...getRemoveResourceController('mfaPhoneCode', model.identifier, false, model.deleteResource, props)}
    />
  );
};

export const RemoveMfaTOTPForm = (props: RemoveMfaTOTPFormProps) => {
  const model = useRemoveMfaTOTPModel();
  if (!model.hasUser) {
    return null;
  }

  return (
    <RemoveResourceForm
      key={model.requestKey}
      {...getRemoveResourceController('mfaTOTP', '', false, model.deleteResource, props)}
    />
  );
};

export const RemovePasskeyForm = (props: RemovePasskeyFormProps) => {
  const model = useRemovePasskeyModel(props.passkey ?? props.passkeyId);

  return (
    <RemoveResourceForm
      key={model.requestKey}
      {...getRemoveResourceController('passkey', model.name, false, model.deleteResource, props)}
    />
  );
};
