import type { ClerkSessionsHost } from './clerk';
import type { LoomClient } from './client';
import type { ProfileActions } from './profile-actions-types';
import type { ProfileEnvironment } from './profile-host-types';

type CurrentUser = () => NonNullable<ClerkSessionsHost['user']>;
type MfaActions = ProfileActions['mfa'];

function factors(environment: ProfileEnvironment): readonly string[] {
  return Object.values(environment.userSettings.attributes).flatMap(attribute =>
    attribute?.used_for_second_factor ? (attribute.second_factors ?? []) : [],
  );
}

function usableCount(user: NonNullable<ClerkSessionsHost['user']>, enabled: readonly string[]): number {
  return (
    Number(enabled.includes('totp') && user.totpEnabled) +
    (enabled.includes('phone_code')
      ? (user.phoneNumbers?.filter(phone => phone.reservedForSecondFactor && phone.verification.status === 'verified')
          .length ?? 0)
      : 0)
  );
}

export function mfaActions(owner: LoomClient, current: CurrentUser, environment: () => ProfileEnvironment): MfaActions {
  const policy = environment();
  const enabled = factors(policy);
  const user = current();
  const phone = (id: string) => {
    const target = current().phoneNumbers?.find(item => item.id === id);
    if (!target) {
      throw new Error('MFA phone unavailable.');
    }
    return target;
  };
  const mutate = (operation: () => Promise<unknown>) =>
    owner.mutateProfile(async () => {
      current();
      await operation();
      current();
    });
  const refresh = async () => {
    const target = current();
    await target.reload?.();
    current();
  };
  const requireRemovable = () => {
    const next = factors(environment());
    if (environment().userSettings.signUp?.mfa?.required && usableCount(current(), next) <= 1) {
      throw new Error('This MFA method cannot be removed.');
    }
  };
  const summarize = (id: string) => {
    const target = phone(id);
    return { id: target.id, phoneNumber: target.phoneNumber, verified: target.verification.status === 'verified' };
  };
  const smsEnabled = enabled.includes('phone_code');
  const totpEnabled = enabled.includes('totp');
  const backupEnabled = enabled.includes('backup_code');
  return {
    available: Boolean(user.phoneNumbers) && (smsEnabled || totpEnabled),
    applicationName: policy.displayConfig.applicationName ?? '',
    findOrCreatePhone:
      smsEnabled && user.createPhoneNumber
        ? async number => {
            let result: ReturnType<typeof summarize> | undefined;
            await mutate(async () => {
              if (!factors(environment()).includes('phone_code')) {
                throw new Error('SMS enrollment unavailable.');
              }
              const target = current();
              const existing = target.phoneNumbers?.find(
                item => !item.reservedForSecondFactor && item.phoneNumber === number,
              );
              if (existing) {
                result = summarize(existing.id);
                return;
              }
              if (!target.createPhoneNumber) {
                throw new Error('SMS enrollment unavailable.');
              }
              const created = await target.createPhoneNumber({ phoneNumber: number });
              current();
              result = {
                id: created.id,
                phoneNumber: created.phoneNumber,
                verified: created.verification.status === 'verified',
              };
            });
            if (!result) {
              throw new Error('SMS enrollment unavailable.');
            }
            return result;
          }
        : undefined,
    enrollSms:
      smsEnabled && user.phoneNumbers
        ? async (id, code) => {
            let result: Awaited<ReturnType<NonNullable<MfaActions['enrollSms']>>> | undefined;
            await mutate(async () => {
              let target = phone(id);
              if (target.verification.status !== 'verified') {
                if (!code) {
                  await target.prepareVerification();
                  current();
                  result = { status: 'needsVerification', phone: summarize(id) };
                  return;
                }
                await target.attemptVerification({ code });
                current();
                target = phone(id);
              }
              if (target.reservedForSecondFactor || !factors(environment()).includes('phone_code')) {
                throw new Error('MFA phone unavailable.');
              }
              const response = await target.setReservedForSecondFactor({ reserved: true });
              current();
              await refresh().catch(() => undefined);
              result = { status: 'complete', backupCodes: response.backupCodes ?? [] };
            });
            if (!result) {
              throw new Error('SMS enrollment unavailable.');
            }
            return result;
          }
        : undefined,
    resendSms:
      smsEnabled && user.phoneNumbers
        ? id =>
            mutate(async () => {
              await phone(id).prepareVerification();
              current();
            })
        : undefined,
    setDefault:
      smsEnabled && user.phoneNumbers
        ? id =>
            mutate(async () => {
              const target = phone(id);
              if (!target.reservedForSecondFactor || target.verification.status !== 'verified') {
                throw new Error('MFA phone unavailable.');
              }
              await target.makeDefaultSecondFactor();
              current();
              await refresh().catch(() => undefined);
            })
        : undefined,
    createAuthenticator:
      totpEnabled && user.createTOTP
        ? async () => {
            let result: { secret: string; uri: string } | undefined;
            await mutate(async () => {
              const target = current();
              if (target.totpEnabled || !factors(environment()).includes('totp') || !target.createTOTP) {
                throw new Error('Authenticator unavailable.');
              }
              const created = await target.createTOTP();
              current();
              result = { secret: created.secret ?? '', uri: created.uri ?? '' };
            });
            if (!result) {
              throw new Error('Authenticator unavailable.');
            }
            return result;
          }
        : undefined,
    verifyAuthenticator:
      totpEnabled && user.verifyTOTP
        ? async code => {
            let backupCodes: readonly string[] = [];
            await mutate(async () => {
              const target = current();
              if (!target.verifyTOTP || !factors(environment()).includes('totp')) {
                throw new Error('Authenticator unavailable.');
              }
              const response = await target.verifyTOTP({ code });
              current();
              backupCodes = response.backupCodes ?? [];
              await refresh().catch(() => undefined);
            });
            return { backupCodes };
          }
        : undefined,
    generateBackupCodes:
      backupEnabled && user.createBackupCode
        ? async () => {
            let codes: readonly string[] = [];
            await mutate(async () => {
              const target = current();
              const next = factors(environment());
              if (!next.includes('backup_code') || usableCount(target, next) === 0 || !target.createBackupCode) {
                throw new Error('Set up an MFA method first.');
              }
              const result = await target.createBackupCode();
              current();
              codes = result.codes;
              await refresh().catch(() => undefined);
            });
            return codes;
          }
        : undefined,
    remove:
      (totpEnabled && user.disableTOTP) || (smsEnabled && user.phoneNumbers)
        ? id =>
            mutate(async () => {
              if (id === 'authenticator') {
                const target = current();
                if (!target.totpEnabled || !target.disableTOTP) {
                  throw new Error('MFA method unavailable.');
                }
                requireRemovable();
                await target.disableTOTP();
              } else {
                const target = phone(id);
                if (!target.reservedForSecondFactor || target.verification.status !== 'verified') {
                  throw new Error('MFA method unavailable.');
                }
                requireRemovable();
                await target.setReservedForSecondFactor({ reserved: false });
              }
              current();
              await refresh().catch(() => undefined);
            })
        : undefined,
  };
}
