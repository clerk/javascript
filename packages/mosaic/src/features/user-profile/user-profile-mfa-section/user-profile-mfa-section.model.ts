import { ClerkRuntimeError, isReverificationCancelledError } from '@clerk/shared/error';
import { getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, PhoneNumberResource, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useReverificationWithState } from '../../reverification/use-reverification-with-state';
import {
  MfaCancelledError,
  type MfaEnrollmentResult,
  type MfaPhone,
  type SmsEnrollmentResult,
  type UserProfileMfaAddableMethod,
  type UserProfileMfaMethod,
  type UserProfileMfaModel,
} from './user-profile-mfa-section.types';

type ReadyModel = Extract<UserProfileMfaModel, { status: 'ready' }>;
type MfaSnapshotData = Pick<ReadyModel, 'methods' | 'addableMethods' | 'phones'>;
type ProtectedResult = Awaited<ReturnType<typeof executeProtectedOperation>>;
type RunProtected = (operation: ProtectedOperation) => Promise<ProtectedResult>;

type ProtectedOperation =
  | { kind: 'createAuthenticator'; userId: string; sessionId: string }
  | { kind: 'reservePhone'; userId: string; sessionId: string; phoneId: string }
  | { kind: 'removeAuthenticator'; userId: string; sessionId: string }
  | { kind: 'removePhone'; userId: string; sessionId: string; phoneId: string }
  | { kind: 'setDefaultPhone'; userId: string; sessionId: string; phoneId: string }
  | { kind: 'generateBackupCodes'; userId: string; sessionId: string };

function configuredFactors(environment: EnvironmentResource | undefined): string[] {
  return Object.values(environment?.userSettings.attributes ?? {}).flatMap(attribute =>
    attribute?.used_for_second_factor ? attribute.second_factors : [],
  );
}

function verifiedReservedPhones(user: UserResource): PhoneNumberResource[] {
  return user.phoneNumbers.filter(phone => phone.reservedForSecondFactor && phone.verification.status === 'verified');
}

function usableFactorCount(user: UserResource, factors: readonly string[]): number {
  return (
    Number(factors.includes('totp') && user.totpEnabled) +
    (factors.includes('phone_code') ? verifiedReservedPhones(user).length : 0)
  );
}

function summarizePhone(phone: PhoneNumberResource): MfaPhone {
  return {
    id: phone.id,
    phoneNumber: phone.phoneNumber,
    verified: phone.verification.status === 'verified',
  };
}

function requireIdentity(clerk: ReturnType<typeof useClerk>, userId: string, sessionId: string): UserResource {
  const current = clerk.user;
  if (!current || current.id !== userId || clerk.session?.id !== sessionId) {
    throw new ClerkRuntimeError('This account changed. Please reopen verification.', { code: 'mfa_account_changed' });
  }
  return current;
}

async function executeProtectedOperation(
  clerk: ReturnType<typeof useClerk>,
  environment: EnvironmentResource | undefined,
  operation: ProtectedOperation,
) {
  const current = requireIdentity(clerk, operation.userId, operation.sessionId);
  const currentSecondFactors = configuredFactors(environment);
  switch (operation.kind) {
    case 'createAuthenticator': {
      if (current.totpEnabled || !currentSecondFactors.includes('totp')) {
        throw new ClerkRuntimeError('Authenticator is unavailable.', { code: 'mfa_authenticator_unavailable' });
      }
      const result = await current.createTOTP();
      return { kind: 'authenticatorSetup', secret: result.secret ?? '', uri: result.uri ?? '' } as const;
    }
    case 'reservePhone': {
      const phone = current.phoneNumbers.find(item => item.id === operation.phoneId);
      if (
        !phone ||
        phone.verification.status !== 'verified' ||
        phone.reservedForSecondFactor ||
        !currentSecondFactors.includes('phone_code')
      ) {
        throw new ClerkRuntimeError('This phone number is unavailable.', { code: 'mfa_phone_unavailable' });
      }
      const result = await phone.setReservedForSecondFactor({ reserved: true });
      return { kind: 'enrollment', backupCodes: result.backupCodes ?? [] } as const;
    }
    case 'removeAuthenticator': {
      const usableCount = usableFactorCount(current, currentSecondFactors);
      if (!current.totpEnabled || (environment?.userSettings.signUp.mfa?.required && usableCount <= 1)) {
        throw new ClerkRuntimeError('This method cannot be removed.', { code: 'mfa_method_cannot_remove' });
      }
      await current.disableTOTP();
      return { kind: 'done' } as const;
    }
    case 'removePhone': {
      const phone = current.phoneNumbers.find(item => item.id === operation.phoneId);
      const usableCount = usableFactorCount(current, currentSecondFactors);
      if (
        !phone?.reservedForSecondFactor ||
        phone.verification.status !== 'verified' ||
        (environment?.userSettings.signUp.mfa?.required && usableCount <= 1)
      ) {
        throw new ClerkRuntimeError('This method cannot be removed.', { code: 'mfa_method_cannot_remove' });
      }
      await phone.setReservedForSecondFactor({ reserved: false });
      return { kind: 'done' } as const;
    }
    case 'setDefaultPhone': {
      const phone = current.phoneNumbers.find(item => item.id === operation.phoneId);
      if (!phone?.reservedForSecondFactor || phone.verification.status !== 'verified') {
        throw new ClerkRuntimeError('This phone number is unavailable.', { code: 'mfa_phone_unavailable' });
      }
      await phone.makeDefaultSecondFactor();
      return { kind: 'done' } as const;
    }
    case 'generateBackupCodes': {
      if (!currentSecondFactors.includes('backup_code') || usableFactorCount(current, currentSecondFactors) === 0) {
        throw new ClerkRuntimeError('Set up a verification method first.', { code: 'mfa_setup_factor_first' });
      }
      const result = await current.createBackupCode();
      return { kind: 'backupCodes', codes: result.codes } as const;
    }
  }
}

function describeMfa(user: UserResource, environment: EnvironmentResource): MfaSnapshotData {
  const secondFactors = configuredFactors(environment);
  const smsEnabled = secondFactors.includes('phone_code');
  const totpEnabled = secondFactors.includes('totp');
  const backupEnabled = secondFactors.includes('backup_code');
  const reservedPhones = verifiedReservedPhones(user);
  const usableCount = usableFactorCount(user, secondFactors);
  const canRemove = !environment.userSettings.signUp.mfa?.required || usableCount > 1;
  const authenticatorEnrolled = totpEnabled && user.totpEnabled;
  const methods: UserProfileMfaMethod[] = [];
  if (authenticatorEnrolled) {
    methods.push({ id: 'authenticator', type: 'authenticator', isDefault: true, canRemove });
  }
  for (const phone of smsEnabled
    ? [...reservedPhones].sort((left, right) => Number(right.defaultSecondFactor) - Number(left.defaultSecondFactor))
    : []) {
    methods.push({
      id: phone.id,
      type: 'sms',
      description: phone.phoneNumber,
      isDefault: !authenticatorEnrolled && phone.defaultSecondFactor,
      canRemove,
      canSetDefault: !authenticatorEnrolled && !phone.defaultSecondFactor,
    });
  }
  if (backupEnabled && user.backupCodeEnabled) {
    methods.push({ id: 'backup-codes', type: 'backup-codes' });
  }
  const addableMethods: UserProfileMfaAddableMethod[] = [];
  if (smsEnabled) {
    addableMethods.push('sms');
  }
  if (totpEnabled && !user.totpEnabled) {
    addableMethods.push('authenticator');
  }
  if (backupEnabled && usableCount > 0 && !user.backupCodeEnabled) {
    addableMethods.push('backup-codes');
  }

  return {
    methods,
    addableMethods,
    phones: user.phoneNumbers.filter(phone => !phone.reservedForSecondFactor).map(summarizePhone),
  };
}

function createSmsActions(
  clerk: ReturnType<typeof useClerk>,
  userId: string,
  sessionId: string,
  runProtected: RunProtected,
  refresh: () => Promise<void>,
): Pick<ReadyModel, 'findOrCreatePhone' | 'enrollSms' | 'resendSms' | 'setDefault'> {
  const currentPhone = (phoneId: string) => {
    const current = requireIdentity(clerk, userId, sessionId);
    const phone = current.phoneNumbers.find(item => item.id === phoneId);
    if (!phone) {
      throw new ClerkRuntimeError('This phone number is unavailable.', { code: 'mfa_phone_unavailable' });
    }
    return phone;
  };

  return {
    findOrCreatePhone: async phoneNumber => {
      const current = requireIdentity(clerk, userId, sessionId);
      const existing = current.phoneNumbers.find(
        phone => !phone.reservedForSecondFactor && phone.phoneNumber === phoneNumber,
      );
      return summarizePhone(existing ?? (await current.createPhoneNumber({ phoneNumber })));
    },
    enrollSms: async (phoneId, code): Promise<SmsEnrollmentResult> => {
      let phone = currentPhone(phoneId);
      if (phone.verification.status !== 'verified') {
        if (!code) {
          await phone.prepareVerification();
          return { status: 'needsVerification', phone: summarizePhone(phone) };
        }
        await phone.attemptVerification({ code });
        phone = currentPhone(phoneId);
      }
      const result = await runProtected({ kind: 'reservePhone', userId, sessionId, phoneId });
      if (result.kind !== 'enrollment') {
        throw new ClerkRuntimeError('The verification response was unexpected. Please try again.', {
          code: 'mfa_unexpected_response',
        });
      }
      await refresh().catch(() => undefined);
      return { status: 'complete', backupCodes: result.backupCodes };
    },
    resendSms: async phoneId => {
      await currentPhone(phoneId).prepareVerification();
    },
    setDefault: async phoneId => {
      await runProtected({ kind: 'setDefaultPhone', userId, sessionId, phoneId });
      await refresh().catch(() => undefined);
    },
  };
}

export function useUserProfileMfaModel(): UserProfileMfaModel {
  const clerk = useClerk();
  const { isLoaded: userLoaded, user } = useUser();
  const { isLoaded: sessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();

  const [protectedAction, reverification, resetReverification] = useReverificationWithState(
    (operation: ProtectedOperation) => executeProtectedOperation(clerk, environment, operation),
  );

  if (!userLoaded || !sessionLoaded || !environment) {
    return { status: 'loading', reverification, resetReverification };
  }
  if (!user || !session) {
    return { status: 'hidden', reverification, resetReverification };
  }

  const secondFactors = configuredFactors(environment);
  const smsEnabled = secondFactors.includes('phone_code');
  const totpEnabled = secondFactors.includes('totp');
  const backupEnabled = secondFactors.includes('backup_code');
  if (!smsEnabled && !totpEnabled) {
    return { status: 'hidden', reverification, resetReverification };
  }

  const userId = user.id;
  const sessionId = session.id;
  const { methods, addableMethods, phones } = describeMfa(user, environment);
  const usableCount = usableFactorCount(user, secondFactors);
  const refresh = async () => {
    const current = requireIdentity(clerk, userId, sessionId);
    await current.reload();
  };
  const runProtected = async (operation: ProtectedOperation) => {
    try {
      return await protectedAction(operation);
    } catch (error) {
      if (isReverificationCancelledError(error)) {
        throw new MfaCancelledError('Verification was cancelled.');
      }
      throw error;
    }
  };

  const smsActions = smsEnabled ? createSmsActions(clerk, userId, sessionId, runProtected, refresh) : {};

  return {
    status: 'ready',
    userId,
    sessionId,
    applicationName: environment.displayConfig.applicationName,
    identifier: getIdentifier(user),
    methods,
    addableMethods,
    phones,
    reverification,
    resetReverification,
    ...smsActions,
    createAuthenticator: totpEnabled
      ? async () => {
          const result = await runProtected({ kind: 'createAuthenticator', userId, sessionId });
          if (result.kind !== 'authenticatorSetup') {
            throw new ClerkRuntimeError('The verification response was unexpected. Please try again.', {
              code: 'mfa_unexpected_response',
            });
          }
          return { secret: result.secret, uri: result.uri };
        }
      : undefined,
    verifyAuthenticator: totpEnabled
      ? async (code): Promise<MfaEnrollmentResult> => {
          const result = await requireIdentity(clerk, userId, sessionId).verifyTOTP({ code });
          const backupCodes = result.backupCodes ?? [];
          await refresh().catch(() => undefined);
          return { backupCodes };
        }
      : undefined,
    generateBackupCodes:
      backupEnabled && usableCount > 0
        ? async () => {
            const result = await runProtected({ kind: 'generateBackupCodes', userId, sessionId });
            if (result.kind !== 'backupCodes') {
              throw new ClerkRuntimeError('The verification response was unexpected. Please try again.', {
                code: 'mfa_unexpected_response',
              });
            }
            await refresh().catch(() => undefined);
            return result.codes;
          }
        : undefined,
    remove: async methodId => {
      const operation: ProtectedOperation =
        methodId === 'authenticator'
          ? { kind: 'removeAuthenticator', userId, sessionId }
          : { kind: 'removePhone', userId, sessionId, phoneId: methodId };
      await runProtected(operation);
      await refresh().catch(() => undefined);
    },
  };
}
