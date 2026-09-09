import { useClerk } from '@clerk/react';
import { useMemo } from 'react';

import { waitForNativeResources } from '../provider/nativeResourceConnection';
import { getClerkInstance } from '../provider/singleton';
import { errorThrower } from '../utils/errors';
import type { BiometricCredential, UseBiometricCredentialsReturn } from './types';

const DEFAULT_POLICY = 'biometry_or_device_passcode';

async function resources(clerk: ReturnType<typeof useClerk>) {
  const owner = getClerkInstance();
  if (!owner?.__internal_getMobileResources) {
    return errorThrower.throw(
      'Biometric credentials require a development build containing a compatible version of @clerk/expo.',
    );
  }
  await waitForNativeResources(owner);
  if (owner !== getClerkInstance() || owner.client !== clerk.client) {
    return errorThrower.throw('The Clerk provider changed before the native operation could start.');
  }
  return owner.__internal_getMobileResources();
}

function toCredential(
  value: Awaited<ReturnType<Awaited<ReturnType<typeof resources>>['biometricCredentials']['list']>>[number],
): BiometricCredential {
  return {
    ...value,
    object: 'trusted_device',
    platform: value.platform === 'ios' ? 'ios' : value.platform === 'android' ? 'android' : 'unknown',
    status: value.status === 'active' ? 'active' : value.status === 'revoked' ? 'revoked' : 'unknown',
  };
}

function createBiometricCredentials(clerk: ReturnType<typeof useClerk>): UseBiometricCredentialsReturn {
  return {
    getAvailability: async params => {
      const result = await (await resources(clerk)).biometricCredentials.availability(params);
      return {
        ...result,
        unavailableReason: result.unavailableReason?.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase() ?? null,
      };
    },
    list: async () => (await (await resources(clerk)).biometricCredentials.list()).map(toCredential),
    enroll: async params =>
      toCredential(
        await (
          await resources(clerk)
        ).biometricCredentials.enroll({ ...params, policy: params?.policy ?? DEFAULT_POLICY }),
      ),
    revoke: async id => toCredential(await (await resources(clerk)).biometricCredentials.revoke({ id })),
    signIn: async params => {
      const { signIn } = await resources(clerk);
      const { error } = await signIn.biometricCredential(params);
      if (error) throw error;
      const legacySignIn = clerk.client?.signIn;
      if (!legacySignIn) return errorThrower.throw('The Clerk sign-in resource is unavailable.');
      return {
        status: signIn.status,
        createdSessionId: signIn.createdSessionId,
        signIn: legacySignIn,
        setActive: clerk.setActive,
      };
    },
  };
}

/** The JavaScript owner manages credentials; native adapters present prompts and retain private keys. */
export function useBiometricCredentials(): UseBiometricCredentialsReturn {
  const clerk = useClerk();
  return useMemo(() => createBiometricCredentials(clerk), [clerk]);
}
