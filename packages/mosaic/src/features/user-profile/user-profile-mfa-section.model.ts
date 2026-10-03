import { isClerkAPIResponseError, isReverificationCancelledError } from '@clerk/shared/error';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, PhoneNumberResource, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useErrorText, useMessages } from '../../localization';
import { useReverificationWithState } from '../reverification/use-reverification-with-state';
import {
  MfaCancelledError,
  type MfaEnrollmentResult,
  type MfaPhone,
  type SmsEnrollmentResult,
  type UserProfileMfaAddableMethod,
  type UserProfileMfaMethod,
  type UserProfileMfaModel,
} from './user-profile-mfa-section.types';

type ProtectedOperation =
  | { kind: 'createAuthenticator'; userId: string; sessionId: string }
  | { kind: 'reservePhone'; userId: string; sessionId: string; phoneId: string }
  | { kind: 'removeAuthenticator'; userId: string; sessionId: string }
  | { kind: 'removePhone'; userId: string; sessionId: string; phoneId: string }
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

function errorMessage(error: unknown, localize: ReturnType<typeof useErrorText>): Error {
  if (error instanceof MfaCancelledError) {
    return error;
  }
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    if (first) {
      return new Error(
        localize({ code: first.code, paramName: first.meta?.paramName, message: first.longMessage || first.message }),
      );
    }
  }
  return new Error(localize({ message: error instanceof Error ? error.message : undefined }));
}

export function useUserProfileMfaModel(): UserProfileMfaModel {
  const clerk = useClerk();
  const { isLoaded: userLoaded, user } = useUser();
  const { isLoaded: sessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  const localize = useErrorText();
  const m = useMessages('userProfileMfa');

  const requireIdentity = (userId: string, sessionId: string): UserResource => {
    const current = clerk.user;
    if (!current || current.id !== userId || clerk.session?.id !== sessionId) {
      throw new Error(m.errors.accountChanged);
    }
    return current;
  };

  const [protectedAction, reverification, resetReverification] = useReverificationWithState(
    async (operation: ProtectedOperation) => {
      const current = requireIdentity(operation.userId, operation.sessionId);
      const currentSecondFactors = configuredFactors(environment);
      switch (operation.kind) {
        case 'createAuthenticator': {
          if (current.totpEnabled || !currentSecondFactors.includes('totp')) {
            throw new Error(m.errors.authenticatorUnavailable);
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
            throw new Error(m.errors.phoneUnavailable);
          }
          const result = await phone.setReservedForSecondFactor({ reserved: true });
          return { kind: 'enrollment', backupCodes: result.backupCodes ?? [] } as const;
        }
        case 'removeAuthenticator': {
          const usableCount = usableFactorCount(current, currentSecondFactors);
          if (!current.totpEnabled || (environment?.userSettings.signUp.mfa?.required && usableCount <= 1)) {
            throw new Error(m.errors.methodCannotRemove);
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
            throw new Error(m.errors.methodCannotRemove);
          }
          await phone.setReservedForSecondFactor({ reserved: false });
          return { kind: 'done' } as const;
        }
        case 'generateBackupCodes': {
          if (!currentSecondFactors.includes('backup_code') || usableFactorCount(current, currentSecondFactors) === 0) {
            throw new Error(m.errors.setupFactorFirst);
          }
          const result = await current.createBackupCode();
          return { kind: 'backupCodes', codes: result.codes } as const;
        }
      }
    },
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
  const reservedPhones = verifiedReservedPhones(user);
  const usableCount = usableFactorCount(user, secondFactors);
  const canRemove = !environment.userSettings.signUp.mfa?.required || usableCount > 1;
  const methods: UserProfileMfaMethod[] = [];
  if (totpEnabled && user.totpEnabled) {
    methods.push({ id: 'authenticator', type: 'authenticator', isDefault: true, canRemove });
  }
  for (const phone of smsEnabled
    ? [...reservedPhones].sort((left, right) => Number(right.defaultSecondFactor) - Number(left.defaultSecondFactor))
    : []) {
    methods.push({
      id: phone.id,
      type: 'sms',
      description: phone.phoneNumber,
      isDefault: !(totpEnabled && user.totpEnabled) && phone.defaultSecondFactor,
      canRemove,
      canSetDefault: !phone.defaultSecondFactor,
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

  const refresh = async () => {
    const current = requireIdentity(userId, sessionId);
    await current.reload();
  };
  const runProtected = async (operation: ProtectedOperation) => {
    try {
      return await protectedAction(operation);
    } catch (error) {
      if (isReverificationCancelledError(error)) {
        throw new MfaCancelledError('Verification was cancelled.');
      }
      throw errorMessage(error, localize);
    }
  };
  const currentPhone = (phoneId: string) => {
    const current = requireIdentity(userId, sessionId);
    const phone = current.phoneNumbers.find(item => item.id === phoneId);
    if (!phone) {
      throw new Error(m.errors.phoneUnavailable);
    }
    return phone;
  };

  return {
    status: 'ready',
    userId,
    sessionId,
    methods,
    addableMethods,
    phones: user.phoneNumbers.filter(phone => !phone.reservedForSecondFactor).map(summarizePhone),
    reverification,
    resetReverification,
    createPhone: smsEnabled
      ? async phoneNumber => {
          try {
            const created = await requireIdentity(userId, sessionId).createPhoneNumber({ phoneNumber });
            return summarizePhone(created);
          } catch (error) {
            throw errorMessage(error, localize);
          }
        }
      : undefined,
    enrollSms: smsEnabled
      ? async (phoneId, code): Promise<SmsEnrollmentResult> => {
          try {
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
              throw new Error(m.errors.unexpectedResponse);
            }
            await refresh().catch(() => undefined);
            return { status: 'complete', backupCodes: result.backupCodes };
          } catch (error) {
            throw errorMessage(error, localize);
          }
        }
      : undefined,
    resendSms: smsEnabled
      ? async phoneId => {
          try {
            await currentPhone(phoneId).prepareVerification();
          } catch (error) {
            throw errorMessage(error, localize);
          }
        }
      : undefined,
    createAuthenticator: totpEnabled
      ? async () => {
          const result = await runProtected({ kind: 'createAuthenticator', userId, sessionId });
          if (result.kind !== 'authenticatorSetup') {
            throw new Error(m.errors.unexpectedResponse);
          }
          return { secret: result.secret, uri: result.uri };
        }
      : undefined,
    verifyAuthenticator: totpEnabled
      ? async (code): Promise<MfaEnrollmentResult> => {
          try {
            const result = await requireIdentity(userId, sessionId).verifyTOTP({ code });
            const backupCodes = result.backupCodes ?? [];
            await refresh().catch(() => undefined);
            return { backupCodes };
          } catch (error) {
            throw errorMessage(error, localize);
          }
        }
      : undefined,
    generateBackupCodes:
      backupEnabled && usableCount > 0
        ? async () => {
            const result = await runProtected({ kind: 'generateBackupCodes', userId, sessionId });
            if (result.kind !== 'backupCodes') {
              throw new Error(m.errors.unexpectedResponse);
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
    setDefault: smsEnabled
      ? async phoneId => {
          try {
            const phone = currentPhone(phoneId);
            if (phone.verification.status !== 'verified' || !phone.reservedForSecondFactor) {
              throw new Error(m.errors.phoneUnavailable);
            }
            await phone.makeDefaultSecondFactor();
            await refresh().catch(() => undefined);
          } catch (error) {
            throw errorMessage(error, localize);
          }
        }
      : undefined,
  };
}
