import { ClerkRuntimeError } from '@clerk/shared/error';

import type { Clerk } from '../core/clerk';
import { BaseResource } from '../core/resources/internal';

type EnrollmentParams = {
  platform: string;
  appIdentifier: string;
  name?: string;
  algorithm: string;
  publicKeyJWK: string;
  clientData?: string;
  signature?: string;
};

const enrollmentBody = ({ publicKeyJWK, ...params }: EnrollmentParams) => ({ ...params, publicKeyJwk: publicKeyJWK });

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
    listNativeBiometricCredentials: () => fetchResponse({ path: '/me/biometric_credentials', method: 'GET' }),
    prepareNativeBiometricEnrollment: (sessionId: string, params: EnrollmentParams) =>
      fetchResponse({
        path: '/me/biometric_credentials/prepare',
        method: 'POST',
        sessionId,
        body: enrollmentBody(params) as any,
      }),
    attemptNativeBiometricEnrollment: (sessionId: string, params: EnrollmentParams) =>
      fetchResponse({
        path: '/me/biometric_credentials/attempt',
        method: 'POST',
        sessionId,
        body: enrollmentBody(params) as any,
      }),
    validateNativeBiometricCredential: (trustedDeviceId: string) =>
      fetchResponse({
        path: '/client/biometric_credentials/validate',
        method: 'POST',
        body: { trustedDeviceId } as any,
      }),
    revokeNativeBiometricCredential: (id: string, sessionId?: string) =>
      fetchResponse({ path: `/me/biometric_credentials/${encodeURIComponent(id)}`, method: 'DELETE', sessionId }),
    attemptNativePasskeyVerification: (id: string, publicKeyCredential: string) =>
      fetchResponse({
        path: `/me/passkeys/${encodeURIComponent(id)}/attempt_verification`,
        method: 'POST',
        body: { strategy: 'passkey', publicKeyCredential } as any,
      }),
  };
}
