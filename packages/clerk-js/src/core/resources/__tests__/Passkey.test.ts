import { ClerkWebAuthnError } from '@clerk/shared/error';
import type { PasskeyJSON } from '@clerk/shared/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clerkMock } from '../../../test/core-fixtures';
import { BaseResource, Passkey } from '../internal';

const publicKeyOptions = (authenticatorAttachment?: 'platform' | 'cross-platform') => ({
  rp: { id: 'clerk.com', name: 'Clerk' },
  user: { id: 'dXNlcl8x', name: 'user@clerk.com', displayName: 'user' },
  challenge: 'Y2hhbGxlbmdl',
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  ...(authenticatorAttachment ? { authenticatorSelection: { authenticatorAttachment } } : {}),
});

const passkeyJSON = (authenticatorAttachment?: 'platform' | 'cross-platform') =>
  ({
    object: 'passkey',
    id: 'idn_passkey',
    name: 'Chrome on macOS',
    last_used_at: null,
    created_at: 1717430400000,
    updated_at: 1717430400000,
    verification: {
      object: 'verification',
      id: 'ver_1',
      status: 'unverified',
      strategy: 'passkey',
      nonce: JSON.stringify(publicKeyOptions(authenticatorAttachment)),
      attempts: 0,
      expire_at: 1717431000000,
    },
  }) as unknown as PasskeyJSON;

const cancelledError = new ClerkWebAuthnError('Passkey registration was cancelled or timed out.', {
  code: 'passkey_registration_cancelled',
});

const successfulCredential = {
  type: 'public-key',
  id: 'credential',
  rawId: new ArrayBuffer(1),
  authenticatorAttachment: 'platform',
  response: {
    clientDataJSON: new ArrayBuffer(1),
    attestationObject: new ArrayBuffer(1),
    getTransports: () => ['internal'],
  },
  getClientExtensionResults: () => ({}),
};

const setupClerk = (createPublicCredentials: () => Promise<any>, platformAuthenticatorSupported = true) => {
  BaseResource.clerk = clerkMock({
    __internal_isWebAuthnSupported: () => true,
    __internal_isWebAuthnPlatformAuthenticatorSupported: () => Promise.resolve(platformAuthenticatorSupported),
    __internal_createPublicCredentials: createPublicCredentials,
  } as any) as any;
};

const deleteCall = { method: 'DELETE', path: '/me/passkeys/idn_passkey' };

describe('Passkey', () => {
  afterEach(() => {
    BaseResource.clerk = null as any;
    vi.restoreAllMocks();
  });

  describe('registerPasskey', () => {
    it('deletes the pending passkey when the browser prompt is cancelled', async () => {
      setupClerk(() => Promise.resolve({ publicKeyCredential: null, error: cancelledError }));
      const fetchMock = vi.fn().mockResolvedValue({ response: passkeyJSON() });
      (BaseResource as any)._fetch = fetchMock;

      await expect(Passkey.registerPasskey()).rejects.toBe(cancelledError);

      expect(fetchMock).toHaveBeenCalledWith(deleteCall);
      expect(fetchMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ path: '/me/passkeys/idn_passkey/attempt_verification' }),
      );
    });

    it('surfaces the original error when the cleanup itself fails', async () => {
      setupClerk(() => Promise.resolve({ publicKeyCredential: null, error: cancelledError }));
      const fetchMock = vi.fn().mockImplementation(({ method }) => {
        if (method === 'DELETE') {
          return Promise.reject(new Error('session_reverification_required'));
        }
        return Promise.resolve({ response: passkeyJSON() });
      });
      (BaseResource as any)._fetch = fetchMock;

      await expect(Passkey.registerPasskey()).rejects.toBe(cancelledError);
    });

    it('deletes the pending passkey when the device lacks a platform authenticator', async () => {
      const createPublicCredentials = vi.fn();
      setupClerk(createPublicCredentials as any, false);
      const fetchMock = vi.fn().mockResolvedValue({ response: passkeyJSON('platform') });
      (BaseResource as any)._fetch = fetchMock;

      await expect(Passkey.registerPasskey()).rejects.toMatchObject({ code: 'passkey_pa_not_supported' });

      expect(createPublicCredentials).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(deleteCall);
    });

    it('does not attempt a delete when the created passkey has no id', async () => {
      setupClerk(() => Promise.resolve({ publicKeyCredential: null, error: cancelledError }));
      const fetchMock = vi.fn().mockResolvedValue(null);
      (BaseResource as any)._fetch = fetchMock;

      await expect(Passkey.registerPasskey()).rejects.toThrow();

      expect(fetchMock).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE' }));
    });

    it('does not delete anything when registration succeeds', async () => {
      setupClerk(() => Promise.resolve({ publicKeyCredential: successfulCredential, error: null }));
      const fetchMock = vi.fn().mockResolvedValue({ response: passkeyJSON() });
      (BaseResource as any)._fetch = fetchMock;

      await Passkey.registerPasskey();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', path: '/me/passkeys/idn_passkey/attempt_verification' }),
      );
      expect(fetchMock).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE' }));
    });
  });
});
