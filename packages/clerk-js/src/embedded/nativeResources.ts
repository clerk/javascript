import { ClerkRuntimeError } from '@clerk/shared/error';

import type { Clerk } from '../core/clerk';
import { BaseResource } from '../core/resources/internal';

export function createNativeResourceOperations(clerk: Clerk) {
  const fetchResponse = async (request: Parameters<typeof BaseResource._fetch>[0]) =>
    (await BaseResource._fetch(request))?.response;
  const imageFile = (base64: string) => {
    const binary = atob(base64);
    return new Blob([Uint8Array.from(binary, character => character.charCodeAt(0))], { type: 'image/jpeg' });
  };
  return {
    setNativeProfileImage: (base64: string) => {
      if (!clerk.user) {
        throw new ClerkRuntimeError('No active user', { code: 'not_signed_in' });
      }
      return clerk.user.setProfileImage({ file: imageFile(base64) });
    },
    deleteNativeProfileImage: () => fetchResponse({ path: '/me/profile_image', method: 'DELETE' }),
    setNativeOrganizationLogo: async (id: string, base64: string) =>
      (await clerk.getOrganization(id)).setLogo({ file: imageFile(base64) }),
    deleteNativeOrganizationLogo: (id: string) =>
      fetchResponse({ path: `/organizations/${encodeURIComponent(id)}/logo`, method: 'DELETE' }),
    attemptNativePasskeyVerification: (id: string, publicKeyCredential: string) =>
      fetchResponse({
        path: `/me/passkeys/${encodeURIComponent(id)}/attempt_verification`,
        method: 'POST',
        body: { strategy: 'passkey', publicKeyCredential } as any,
      }),
  };
}
