// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BaseResource, SignIn } from '../internal';

afterEach(() => vi.restoreAllMocks());

describe('legacy passkey entry point with a second factor', () => {
  it.each([false, true])('uses the second-factor endpoints and preserves rejection: %s', async rejected => {
    const verification = {
      status: 'unverified',
      strategy: 'passkey',
      nonce: JSON.stringify({ challenge: 'YQ', rpId: 'example.com' }),
    };
    const initial = {
      id: 'sia_passkey',
      status: 'needs_second_factor',
      supported_second_factors: [{ strategy: 'passkey' }],
      second_factor_verification: verification,
    };
    const resource = new SignIn(initial as any);
    const setActive = vi.fn();
    BaseResource.clerk = {
      client: { signIn: resource, captchaBypass: true },
      setActive,
      __internal_isWebAuthnSupported: () => true,
      __internal_getPublicCredentials: async () => ({
        publicKeyCredential: {
          id: 'credential',
          rawId: new Uint8Array([1]).buffer,
          type: 'public-key',
          response: {
            clientDataJSON: new Uint8Array([2]).buffer,
            authenticatorData: new Uint8Array([3]).buffer,
            signature: new Uint8Array([4]).buffer,
            userHandle: null,
          },
          getClientExtensionResults: () => ({}),
        },
        error: null,
      }),
    } as any;
    const failure = Object.assign(new Error('Credential rejected'), { code: 'passkey_verification_failed' });
    const fetch = vi.spyOn(BaseResource, '_fetch').mockImplementation(async request => {
      const completing = request.path.endsWith('/attempt_second_factor');
      if (completing && rejected) throw failure;
      return {
        response: completing ? { ...initial, status: 'complete', created_session_id: 'sess_passkey' } : initial,
      } as any;
    });

    if (rejected) await expect(resource.authenticateWithPasskey({ flow: 'autofill' })).rejects.toBe(failure);
    else {
      await expect(resource.authenticateWithPasskey({ flow: 'autofill' })).resolves.toBe(resource);
      expect(resource.createdSessionId).toBe('sess_passkey');
    }
    expect(fetch.mock.calls.map(([request]) => request.path.split('/').at(-1))).toEqual([
      'prepare_second_factor',
      'attempt_second_factor',
    ]);
    expect(resource.status).toBe(rejected ? 'needs_second_factor' : 'complete');
    expect(setActive).not.toHaveBeenCalled();
  });
});
