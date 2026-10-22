import { useSuspenseProfile } from '@clerk/loom/react';

import { useReverificationFlow } from '../../features/reverification';
import { projectMfa } from '../../features/user-profile/user-profile-mfa-section/user-profile-mfa-section.project';
import type { UserProfileMfaModel } from '../../features/user-profile/user-profile-mfa-section/user-profile-mfa-section.types';

type ReadyModel = Extract<UserProfileMfaModel, { status: 'ready' }>;

export type LoomMfaState =
  | { kind: 'snapshot'; methods: ReadyModel['methods']; addableMethods: ReadyModel['addableMethods'] }
  | { kind: 'interactive'; model: ReadyModel };

export function useLoomProfileMfaModel(): LoomMfaState | null {
  const { scope, user, settings, actions } = useSuspenseProfile();
  const [remove, removeReverification] = useReverificationFlow((id: string) => {
    if (!actions.mfa.remove) {
      throw new Error('MFA removal unavailable.');
    }
    return actions.mfa.remove(id);
  });
  const [setDefault, setDefaultReverification] = useReverificationFlow((id: string) => {
    if (!actions.mfa.setDefault) {
      throw new Error('MFA default selection unavailable.');
    }
    return actions.mfa.setDefault(id);
  });
  const [generateBackupCodes, backupCodesReverification] = useReverificationFlow(() => {
    if (!actions.mfa.generateBackupCodes) {
      throw new Error('Backup codes unavailable.');
    }
    return actions.mfa.generateBackupCodes();
  });
  const secondFactors = settings.secondFactors ?? [];
  if (!secondFactors.includes('phone_code') && !secondFactors.includes('totp')) {
    return null;
  }
  if (
    !user.phoneNumbers ||
    user.totpEnabled === null ||
    user.totpEnabled === undefined ||
    user.backupCodeEnabled === null ||
    user.backupCodeEnabled === undefined
  ) {
    throw new Error('Loom MFA data is unavailable.');
  }
  const projection = projectMfa(
    {
      phoneNumbers: user.phoneNumbers,
      totpEnabled: user.totpEnabled,
      backupCodeEnabled: user.backupCodeEnabled,
    },
    { secondFactors, required: settings.mfaRequired ?? false },
  );
  if (!actions.mfa.available || !actions.mfa.remove) {
    return { kind: 'snapshot', methods: projection.methods, addableMethods: projection.addableMethods };
  }
  const identifier =
    user.username ||
    user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress ||
    user.phoneNumbers.find(phone => phone.id === user.primaryPhoneNumberId)?.phoneNumber ||
    user.web3Wallets?.find(wallet => wallet.id === user.primaryWeb3WalletId)?.web3Wallet ||
    '';
  return {
    kind: 'interactive',
    model: {
      status: 'ready',
      userId: user.id,
      sessionId: scope.sessionId,
      applicationName: settings.applicationName ?? actions.mfa.applicationName,
      identifier,
      methods: projection.methods,
      addableMethods: projection.addableMethods,
      phones: projection.phones,
      findOrCreatePhone: actions.mfa.findOrCreatePhone,
      enrollSms: actions.mfa.enrollSms,
      resendSms: actions.mfa.resendSms,
      setDefault: actions.mfa.setDefault ? id => setDefault(id) : undefined,
      createAuthenticator: actions.mfa.createAuthenticator,
      verifyAuthenticator: actions.mfa.verifyAuthenticator,
      generateBackupCodes: actions.mfa.generateBackupCodes ? () => generateBackupCodes() : undefined,
      remove,
      removeReverification,
      setDefaultReverification,
      backupCodesReverification,
    },
  };
}
