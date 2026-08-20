import { useClerk } from '@clerk/react';
import { useMemo } from 'react';

import { synchronizeNativeClientToJs, waitForPendingJsToNativeSync } from '../provider/nativeClientSyncCoordinator';
import type { NativeBiometricCredential, NativeBiometricCredentialModule } from '../specs/NativeClerkModule.types';
import { errorThrower } from '../utils/errors';
import { ClerkExpoModule } from '../utils/native-module';
import type {
  BiometricCredential,
  BiometricCredentialPlatform,
  BiometricCredentialStatus,
  UseBiometricCredentialsReturn,
} from './types';

const DEFAULT_POLICY = 'biometry_or_device_passcode';

function toBiometricCredentialPlatform(platform: string): BiometricCredentialPlatform {
  return platform === 'ios' || platform === 'android' ? platform : 'unknown';
}

function toBiometricCredentialStatus(status: string): BiometricCredentialStatus {
  return status === 'active' || status === 'revoked' ? status : 'unknown';
}

function getNativeModule(): NativeBiometricCredentialModule {
  const nativeModule = ClerkExpoModule;

  if (
    !nativeModule?.getTrustedDeviceAvailability ||
    !nativeModule.listTrustedDevices ||
    !nativeModule.enrollTrustedDevice ||
    !nativeModule.revokeTrustedDevice ||
    !nativeModule.signInWithTrustedDevice
  ) {
    return errorThrower.throw(
      'Biometric credentials require a development build containing a compatible version of @clerk/expo.',
    );
  }

  return nativeModule as NativeBiometricCredentialModule;
}

function toBiometricCredential(credential: NativeBiometricCredential): BiometricCredential {
  return {
    ...credential,
    platform: toBiometricCredentialPlatform(credential.platform),
    status: toBiometricCredentialStatus(credential.status),
    createdAt: new Date(credential.createdAt),
    updatedAt: new Date(credential.updatedAt),
    lastUsedAt: credential.lastUsedAt == null ? null : new Date(credential.lastUsedAt),
    revokedAt: credential.revokedAt == null ? null : new Date(credential.revokedAt),
  };
}

function createBiometricCredentials(clerk: ReturnType<typeof useClerk>): UseBiometricCredentialsReturn {
  return {
    getAvailability: async params => {
      const nativeModule = getNativeModule();
      await waitForPendingJsToNativeSync();
      return nativeModule.getTrustedDeviceAvailability(params?.id ?? null, params?.identifierHint ?? null);
    },
    list: async () => {
      const nativeModule = getNativeModule();
      await waitForPendingJsToNativeSync();
      const credentials = await nativeModule.listTrustedDevices();
      return credentials.map(toBiometricCredential);
    },
    enroll: async params => {
      const nativeModule = getNativeModule();
      await waitForPendingJsToNativeSync();
      const credential = await nativeModule.enrollTrustedDevice(
        params?.name ?? null,
        params?.identifierHint ?? null,
        params?.reason ?? null,
        params?.policy ?? DEFAULT_POLICY,
      );
      return toBiometricCredential(credential);
    },
    revoke: async id => {
      const nativeModule = getNativeModule();
      await waitForPendingJsToNativeSync();
      const credential = await nativeModule.revokeTrustedDevice(id);
      return toBiometricCredential(credential);
    },
    signIn: async params => {
      const nativeModule = getNativeModule();
      await waitForPendingJsToNativeSync();
      const nativeSignIn = await nativeModule.signInWithTrustedDevice(
        params?.id ?? null,
        params?.identifierHint ?? null,
        params?.reason ?? null,
      );
      await synchronizeNativeClientToJs();

      const client = clerk.client;
      const signIn = client?.signIn;
      if (!client || !signIn) {
        return errorThrower.throw(
          'Unable to synchronize biometric sign-in with the Clerk JS client: the client sign-in resource is unavailable.',
        );
      }

      const isComplete = nativeSignIn.status === 'complete';
      if (isComplete) {
        if (
          !nativeSignIn.createdSessionId ||
          !client.signedInSessions.some(session => session.id === nativeSignIn.createdSessionId)
        ) {
          return errorThrower.throw(
            'Unable to synchronize biometric sign-in with the Clerk JS client: the created session is missing.',
          );
        }
      } else if (!signIn.id || signIn.id !== nativeSignIn.id) {
        return errorThrower.throw(
          'Unable to synchronize biometric sign-in with the Clerk JS client: the sign-in attempt does not match.',
        );
      }

      return {
        status: isComplete ? nativeSignIn.status : (signIn.status ?? nativeSignIn.status),
        createdSessionId: isComplete
          ? nativeSignIn.createdSessionId
          : (signIn.createdSessionId ?? nativeSignIn.createdSessionId),
        signIn,
        setActive: clerk.setActive,
      };
    },
  };
}

/**
 * Accesses biometric credential enrollment and sign-in on iOS and Android.
 *
 * The private key and biometric prompt are managed by Clerk's native SDK.
 */
export function useBiometricCredentials(): UseBiometricCredentialsReturn {
  const clerk = useClerk();
  return useMemo(() => createBiometricCredentials(clerk), [clerk]);
}
