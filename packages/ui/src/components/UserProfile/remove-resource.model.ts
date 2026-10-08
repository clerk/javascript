import { useClerk, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import type { FormProps } from '@/ui/elements/FormContainer';
import { useEnabledThirdPartyProviders } from '@/ui/hooks';

import type { PasskeyTarget } from './passkey-section.model';
import { useProfileRequestScopeModel } from './profile-request-scope.model';
export { usePasskeyModel as useRemovePasskeyModel } from './passkey-section.model';

export type RemoveEmailFormProps = FormProps & { emailId: string };
export type RemovePhoneFormProps = FormProps & { phoneId: string };
export type RemoveConnectedAccountFormProps = FormProps & { accountId: string };
export type RemoveWeb3WalletFormProps = FormProps & { walletId: string };
export type RemoveMfaPhoneCodeFormProps = FormProps & { phoneId: string };
export type RemoveMfaTOTPFormProps = FormProps;
export type RemovePasskeyFormProps = FormProps & PasskeyTarget;

const useProfileRemovalCommandModel = (target: string, remove: () => Promise<unknown> | undefined) => {
  const scope = useProfileRequestScopeModel(target);
  return {
    requestKey: scope.requestKey,
    deleteResource: async (): Promise<boolean> => {
      if (!scope.canRun()) {
        return false;
      }
      try {
        const request = remove();
        if (!request) {
          return false;
        }
        await request;
        return scope.canRun();
      } catch (error) {
        if (scope.canRun()) {
          throw error;
        }
        return false;
      }
    },
  };
};

const useRemovalIdentifierModel = <T extends string | undefined>(requestKey: string, value: T): T => {
  const current = useRef({ requestKey, value });
  if (current.current.requestKey !== requestKey || current.current.value === undefined) {
    current.current = { requestKey, value };
  }
  return current.current.value;
};

export const useRemoveEmailModel = (emailId: string) => {
  const clerk = useClerk();
  const { user } = useUser();
  const resource = user?.emailAddresses.find(email => email.id === emailId);
  const command = useProfileRemovalCommandModel(`remove-email:${emailId}`, () =>
    clerk.user?.emailAddresses.find(email => email.id === emailId)?.destroy(),
  );
  const identifier = useRemovalIdentifierModel(command.requestKey, resource?.emailAddress);
  return { ...command, identifier, verified: resource?.verification?.status === 'verified' };
};

export const useRemovePhoneModel = (phoneId: string) => {
  const clerk = useClerk();
  const { user } = useUser();
  const resource = user?.phoneNumbers.find(phone => phone.id === phoneId);
  const command = useProfileRemovalCommandModel(`remove-phone:${phoneId}`, () =>
    clerk.user?.phoneNumbers.find(phone => phone.id === phoneId)?.destroy(),
  );
  const identifier = useRemovalIdentifierModel(command.requestKey, resource?.phoneNumber);
  return { ...command, identifier, verified: resource?.verification?.status === 'verified' };
};

export const useRemoveConnectedAccountModel = (accountId: string) => {
  const clerk = useClerk();
  const { user } = useUser();
  const resource = user?.externalAccounts.find(account => account.id === accountId);
  const command = useProfileRemovalCommandModel(`remove-connected-account:${accountId}`, () =>
    clerk.user?.externalAccounts.find(account => account.id === accountId)?.destroy(),
  );
  const provider = useRemovalIdentifierModel(command.requestKey, resource?.provider);
  const { providerToDisplayData } = useEnabledThirdPartyProviders();
  return { ...command, exists: !!provider, name: provider ? providerToDisplayData[provider]?.name || '' : '' };
};

export const useRemoveWeb3WalletModel = (walletId: string) => {
  const clerk = useClerk();
  const { user } = useUser();
  const resource = user?.web3Wallets.find(wallet => wallet.id === walletId);
  const command = useProfileRemovalCommandModel(`remove-web3-wallet:${walletId}`, () =>
    clerk.user?.web3Wallets.find(wallet => wallet.id === walletId)?.destroy(),
  );
  const identifier = useRemovalIdentifierModel(command.requestKey, resource?.web3Wallet);
  return { ...command, identifier, verified: resource?.verification?.status === 'verified' };
};

export const useRemoveMfaPhoneCodeModel = (phoneId: string) => {
  const clerk = useClerk();
  const { user } = useUser();
  // TODO: This logic will need to change when we add more 2fa methods
  const resource = user?.phoneNumbers.find(phone => phone.id === phoneId);
  const command = useProfileRemovalCommandModel(`remove-mfa-phone:${phoneId}`, () => {
    const current = clerk.user?.phoneNumbers.find(phone => phone.id === phoneId);
    return current?.reservedForSecondFactor ? current.setReservedForSecondFactor({ reserved: false }) : undefined;
  });
  const identifier = useRemovalIdentifierModel(command.requestKey, resource?.phoneNumber);
  return { ...command, identifier };
};

export const useRemoveMfaTOTPModel = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const command = useProfileRemovalCommandModel('remove-mfa-totp', () =>
    clerk.user?.totpEnabled ? clerk.user.disableTOTP() : undefined,
  );
  return { ...command, hasUser: !!user };
};
