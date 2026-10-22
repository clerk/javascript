import { ClerkRuntimeError } from '@clerk/shared/error';
import { getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, PhoneNumberResource, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useReverificationFlow } from '../../reverification';
import { projectMfa } from './user-profile-mfa-section.project';
import type {
  MfaEnrollmentResult,
  MfaPhone,
  SmsEnrollmentResult,
  UserProfileMfaModel,
} from './user-profile-mfa-section.types';

type ReadyModel = Extract<UserProfileMfaModel, { status: 'ready' }>;

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

function phoneUnavailable(): ClerkRuntimeError {
  return new ClerkRuntimeError('This phone number is unavailable.', { code: 'mfa_phone_unavailable' });
}

function requireIdentity(clerk: ReturnType<typeof useClerk>, userId: string, sessionId: string): UserResource {
  const current = clerk.user;
  if (!current || current.id !== userId || clerk.session?.id !== sessionId) {
    throw new ClerkRuntimeError('This account changed. Please try again.', { code: 'mfa_account_changed' });
  }
  return current;
}

function requireRemovable(user: UserResource, environment: EnvironmentResource): void {
  if (environment.userSettings.signUp.mfa?.required && usableFactorCount(user, configuredFactors(environment)) <= 1) {
    throw new ClerkRuntimeError('This method cannot be removed.', { code: 'mfa_method_cannot_remove' });
  }
}

function createSmsActions(
  clerk: ReturnType<typeof useClerk>,
  environment: EnvironmentResource,
  userId: string,
  sessionId: string,
  refresh: () => Promise<void>,
  makeDefault: (phone: PhoneNumberResource) => Promise<unknown>,
): Pick<ReadyModel, 'findOrCreatePhone' | 'enrollSms' | 'resendSms' | 'setDefault'> {
  const currentPhone = (phoneId: string) => {
    const current = requireIdentity(clerk, userId, sessionId);
    const phone = current.phoneNumbers.find(item => item.id === phoneId);
    if (!phone) {
      throw phoneUnavailable();
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
      if (phone.reservedForSecondFactor || !configuredFactors(environment).includes('phone_code')) {
        throw phoneUnavailable();
      }
      const result = await phone.setReservedForSecondFactor({ reserved: true });
      await refresh().catch(() => undefined);
      return { status: 'complete', backupCodes: result.backupCodes ?? [] };
    },
    resendSms: async phoneId => {
      await currentPhone(phoneId).prepareVerification();
    },
    setDefault: async phoneId => {
      const phone = currentPhone(phoneId);
      if (phone.verification.status !== 'verified' || !phone.reservedForSecondFactor) {
        throw phoneUnavailable();
      }
      await makeDefault(phone);
      await refresh().catch(() => undefined);
    },
  };
}

async function removeMfaMethod(
  current: UserResource,
  environment: EnvironmentResource,
  methodId: string,
): Promise<void> {
  if (methodId === 'authenticator') {
    if (!current.totpEnabled) {
      throw new ClerkRuntimeError('This method cannot be removed.', { code: 'mfa_method_cannot_remove' });
    }
    requireRemovable(current, environment);
    await current.disableTOTP();
  } else {
    const phone = current.phoneNumbers.find(item => item.id === methodId);
    if (!phone?.reservedForSecondFactor || phone.verification.status !== 'verified') {
      throw new ClerkRuntimeError('This method cannot be removed.', { code: 'mfa_method_cannot_remove' });
    }
    requireRemovable(current, environment);
    await phone.setReservedForSecondFactor({ reserved: false });
  }
  await current.reload().catch(() => undefined);
}

export function useUserProfileMfaModel(): UserProfileMfaModel {
  const clerk = useClerk();
  const { isLoaded: userLoaded, user } = useUser();
  const { isLoaded: sessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  const [removeMethod, removeReverification] = useReverificationFlow(removeMfaMethod);
  const [makeDefault, setDefaultReverification] = useReverificationFlow((phone: PhoneNumberResource) =>
    phone.makeDefaultSecondFactor(),
  );
  const [createBackupCode, backupCodesReverification] = useReverificationFlow((current: UserResource) =>
    current.createBackupCode(),
  );

  if (!userLoaded || !sessionLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!user || !session) {
    return { status: 'hidden' };
  }

  const secondFactors = configuredFactors(environment);
  const smsEnabled = secondFactors.includes('phone_code');
  const totpEnabled = secondFactors.includes('totp');
  const backupEnabled = secondFactors.includes('backup_code');
  if (!smsEnabled && !totpEnabled) {
    return { status: 'hidden' };
  }

  const userId = user.id;
  const sessionId = session.id;
  const { methods, addableMethods, phones } = projectMfa(user, {
    secondFactors,
    required: Boolean(environment.userSettings.signUp.mfa?.required),
  });
  const usableCount = usableFactorCount(user, secondFactors);
  const refresh = async () => {
    const current = requireIdentity(clerk, userId, sessionId);
    await current.reload();
  };

  const smsActions = smsEnabled ? createSmsActions(clerk, environment, userId, sessionId, refresh, makeDefault) : {};

  return {
    status: 'ready',
    userId,
    sessionId,
    applicationName: environment.displayConfig.applicationName,
    identifier: getIdentifier(user),
    methods,
    addableMethods,
    phones,
    ...smsActions,
    createAuthenticator: totpEnabled
      ? async () => {
          const current = requireIdentity(clerk, userId, sessionId);
          if (current.totpEnabled || !configuredFactors(environment).includes('totp')) {
            throw new ClerkRuntimeError('Authenticator is unavailable.', { code: 'mfa_authenticator_unavailable' });
          }
          const result = await current.createTOTP();
          return { secret: result.secret ?? '', uri: result.uri ?? '' };
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
            const current = requireIdentity(clerk, userId, sessionId);
            const currentFactors = configuredFactors(environment);
            if (!currentFactors.includes('backup_code') || usableFactorCount(current, currentFactors) === 0) {
              throw new ClerkRuntimeError('Set up a verification method first.', { code: 'mfa_setup_factor_first' });
            }
            const result = await createBackupCode(current);
            await refresh().catch(() => undefined);
            return result.codes;
          }
        : undefined,
    remove: methodId => removeMethod(requireIdentity(clerk, userId, sessionId), environment, methodId),
    removeReverification,
    setDefaultReverification,
    backupCodesReverification,
  };
}
