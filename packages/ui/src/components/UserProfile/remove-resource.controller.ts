import type { RemoveFormProps } from '@/ui/common/remove-resource.model';
import { localizationKeys } from '@/ui/customizables';
import type { FormProps } from '@/ui/elements/FormContainer';

type ResourceKind = 'email' | 'phone' | 'connectedAccount' | 'web3Wallet' | 'mfaPhoneCode' | 'mfaTOTP' | 'passkey';

export type ProfileRemovalController = RemoveFormProps;

export const getRemoveResourceController = (
  kind: ResourceKind,
  identifier: string,
  verified: boolean,
  deleteResource: RemoveFormProps['deleteResource'],
  props: FormProps,
): ProfileRemovalController => {
  const actions = { deleteResource, onSuccess: props.onSuccess, onReset: props.onReset };

  switch (kind) {
    case 'email':
      return {
        ...actions,
        title: localizationKeys('userProfile.emailAddressPage.removeResource.title'),
        messageLine1: localizationKeys('userProfile.emailAddressPage.removeResource.messageLine1', { identifier }),
        messageLine2: verified
          ? localizationKeys('userProfile.emailAddressPage.removeResource.messageLine2')
          : undefined,
        successMessage: localizationKeys('userProfile.emailAddressPage.removeResource.successMessage', {
          emailAddress: identifier,
        }),
      };
    case 'phone':
      return {
        ...actions,
        title: localizationKeys('userProfile.phoneNumberPage.removeResource.title'),
        messageLine1: localizationKeys('userProfile.phoneNumberPage.removeResource.messageLine1', { identifier }),
        messageLine2: verified
          ? localizationKeys('userProfile.phoneNumberPage.removeResource.messageLine2')
          : undefined,
        successMessage: localizationKeys('userProfile.phoneNumberPage.removeResource.successMessage', {
          phoneNumber: identifier,
        }),
      };
    case 'connectedAccount':
      return {
        ...actions,
        title: localizationKeys('userProfile.connectedAccountPage.removeResource.title'),
        messageLine1: localizationKeys('userProfile.connectedAccountPage.removeResource.messageLine1', { identifier }),
        messageLine2: localizationKeys('userProfile.connectedAccountPage.removeResource.messageLine2'),
        successMessage: localizationKeys('userProfile.connectedAccountPage.removeResource.successMessage', {
          connectedAccount: identifier,
        }),
      };
    case 'web3Wallet':
      return {
        ...actions,
        title: localizationKeys('userProfile.web3WalletPage.removeResource.title'),
        messageLine1: localizationKeys('userProfile.web3WalletPage.removeResource.messageLine1', { identifier }),
        messageLine2: verified ? localizationKeys('userProfile.web3WalletPage.removeResource.messageLine2') : undefined,
        successMessage: localizationKeys('userProfile.web3WalletPage.removeResource.successMessage', {
          web3Wallet: identifier,
        }),
      };
    case 'mfaPhoneCode':
      return {
        ...actions,
        title: localizationKeys('userProfile.mfaPhoneCodePage.removeResource.title'),
        messageLine1: localizationKeys('userProfile.mfaPhoneCodePage.removeResource.messageLine1', { identifier }),
        messageLine2: localizationKeys('userProfile.mfaPhoneCodePage.removeResource.messageLine2'),
        successMessage: localizationKeys('userProfile.mfaPhoneCodePage.removeResource.successMessage', {
          mfaPhoneCode: identifier,
        }),
      };
    case 'mfaTOTP':
      return {
        ...actions,
        title: localizationKeys('userProfile.mfaTOTPPage.removeResource.title'),
        messageLine1: localizationKeys('userProfile.mfaTOTPPage.removeResource.messageLine1'),
        messageLine2: localizationKeys('userProfile.mfaTOTPPage.removeResource.messageLine2'),
        successMessage: localizationKeys('userProfile.mfaTOTPPage.removeResource.successMessage'),
      };
    case 'passkey':
      return {
        ...actions,
        title: localizationKeys('userProfile.passkeyScreen.removeResource.title'),
        messageLine1: localizationKeys('userProfile.passkeyScreen.removeResource.messageLine1', { name: identifier }),
      };
  }
};
