import { webAuthnCreateCredential, webAuthnGetCredential } from '@clerk/shared/internal/clerk-js/passkeys';
import { isWebAuthnAutofillSupported } from '@clerk/shared/webauthn';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PasskeyBridge } from '../../shared/types';
import type { ClerkPasskeyHost } from '../index';
import { createPasskeyProvider, createPasskeys } from '../index';

vi.mock('@clerk/shared/internal/clerk-js/passkeys', async importOriginal => {
  const original = await importOriginal<Record<string, unknown>>();
  return {
    ...original,
    webAuthnCreateCredential: vi.fn(),
    webAuthnGetCredential: vi.fn(),
  };
});

vi.mock('@clerk/shared/webauthn', () => ({
  isWebAuthnAutofillSupported: vi.fn(() => Promise.resolve(true)),
  isWebAuthnPlatformAuthenticatorSupported: vi.fn(() => Promise.resolve(true)),
}));

const HELLO_B64URL = 'aGVsbG8';

const creationOptions = () =>
  ({
    rp: { id: 'example.com', name: 'Example' },
    user: { id: new Uint8Array([1]).buffer, name: 'jdoe', displayName: 'J Doe' },
    challenge: new Uint8Array([1, 2, 3]).buffer,
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    timeout: 60_000,
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: true,
      residentKey: 'required',
      userVerification: 'required',
    },
    attestation: 'none',
    excludeCredentials: [],
  }) as never;

const requestOptions = () =>
  ({
    challenge: new Uint8Array([1, 2, 3]).buffer,
    rpId: 'example.com',
    timeout: 60_000,
    userVerification: 'required',
    allowCredentials: [],
  }) as never;

const creationOptionsForRpId = (rpId: string) =>
  ({
    ...creationOptions(),
    rp: { id: rpId, name: 'Example' },
  }) as never;

const requestOptionsForRpId = (rpId: string) =>
  ({
    ...requestOptions(),
    rpId,
  }) as never;

const registrationJSON = {
  id: HELLO_B64URL,
  rawId: HELLO_B64URL,
  type: 'public-key',
  response: { clientDataJSON: HELLO_B64URL, attestationObject: HELLO_B64URL },
};

const authenticationJSON = {
  id: HELLO_B64URL,
  rawId: HELLO_B64URL,
  type: 'public-key',
  response: {
    clientDataJSON: HELLO_B64URL,
    authenticatorData: HELLO_B64URL,
    signature: HELLO_B64URL,
  },
};

const makeBridge = (overrides: Partial<PasskeyBridge> = {}): PasskeyBridge => ({
  create: vi.fn(() => Promise.resolve({ ok: true as const, credential: registrationJSON as never })),
  get: vi.fn(() => Promise.resolve({ ok: true as const, credential: authenticationJSON as never })),
  capabilities: vi.fn(() => Promise.resolve({ available: true, platformAuthenticator: true, securityKeys: true })),
  electronMajor: 42,
  platform: 'darwin',
  ...overrides,
});

type Env = {
  protocol?: string;
  hostname?: string;
  hasWebAuthn?: boolean;
  bridge?: PasskeyBridge;
};

function stubEnvironment({ protocol = 'https:', hostname = 'example.com', hasWebAuthn = true, bridge }: Env) {
  vi.stubGlobal('location', { protocol, hostname });
  vi.stubGlobal('window', {
    ...(hasWebAuthn ? { PublicKeyCredential: function PublicKeyCredential() {} } : {}),
    ...(bridge ? { __clerk_internal_electron_passkeys: bridge } : {}),
  });
}

describe('createPasskeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('create', () => {
    it('uses the renderer path on a matching https origin', async () => {
      const bridge = makeBridge();
      stubEnvironment({ bridge });
      const rendererResult = { publicKeyCredential: {} as never, error: null };
      vi.mocked(webAuthnCreateCredential).mockResolvedValue(rendererResult);

      const result = await createPasskeys().create(creationOptions());

      expect(result).toBe(rendererResult);
      expect(bridge.create).not.toHaveBeenCalled();
    });

    it('uses the native path for local bundles', async () => {
      const bridge = makeBridge();
      stubEnvironment({ protocol: 'file:', hostname: '', bridge });

      const result = await createPasskeys().create(creationOptions());

      expect(bridge.create).toHaveBeenCalledWith(
        expect.objectContaining({ rp: { id: 'example.com', name: 'Example' }, challenge: 'AQID' }),
      );
      expect(webAuthnCreateCredential).not.toHaveBeenCalled();
      expect(result.error).toBeNull();
      expect(result.publicKeyCredential?.id).toBe(HELLO_B64URL);
      expect(result.publicKeyCredential?.toJSON()).toEqual(registrationJSON);
    });

    it('retries natively when the renderer rejects the RP ID', async () => {
      const bridge = makeBridge();
      stubEnvironment({ bridge });
      vi.mocked(webAuthnCreateCredential).mockResolvedValue({
        publicKeyCredential: null,
        error: Object.assign(new Error('rp mismatch'), { code: 'passkey_invalid_rpID_or_domain' }),
      } as never);

      const result = await createPasskeys().create(creationOptions());

      expect(bridge.create).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('retries natively when browser WebAuthn does not support public key credentials', async () => {
      const bridge = makeBridge();
      stubEnvironment({ protocol: 'http:', hostname: 'localhost', bridge });
      vi.mocked(webAuthnCreateCredential).mockResolvedValue({
        publicKeyCredential: null,
        error: Object.assign(new Error('The user agent does not support public key credentials.'), {
          name: 'NotSupportedError',
        }),
      } as never);

      const result = await createPasskeys().create(creationOptionsForRpId('localhost'));

      expect(webAuthnCreateCredential).toHaveBeenCalled();
      expect(bridge.create).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('does not retry natively when the user cancels in the renderer', async () => {
      const bridge = makeBridge();
      stubEnvironment({ bridge });
      const cancelled = {
        publicKeyCredential: null,
        error: Object.assign(new Error('cancelled'), { code: 'passkey_registration_cancelled' }),
      };
      vi.mocked(webAuthnCreateCredential).mockResolvedValue(cancelled as never);

      const result = await createPasskeys().create(creationOptions());

      expect(result).toBe(cancelled);
      expect(bridge.create).not.toHaveBeenCalled();
    });

    it('does not retry natively for unsupported browser WebAuthn when renderer mode is forced', async () => {
      const bridge = makeBridge();
      stubEnvironment({ protocol: 'http:', hostname: 'localhost', bridge });
      const unsupported = {
        publicKeyCredential: null,
        error: Object.assign(new Error('The user agent does not support public key credentials.'), {
          name: 'NotSupportedError',
        }),
      };
      vi.mocked(webAuthnCreateCredential).mockResolvedValue(unsupported as never);

      const result = await createPasskeys({ mode: 'renderer' }).create(creationOptionsForRpId('localhost'));

      expect(result).toBe(unsupported);
      expect(bridge.create).not.toHaveBeenCalled();
    });

    it('maps native error envelopes to ClerkWebAuthnError', async () => {
      const bridge = makeBridge({
        create: vi.fn(() =>
          Promise.resolve({
            ok: false as const,
            error: { code: 'cancelled' as const, message: 'user cancelled' },
          }),
        ),
      });
      stubEnvironment({ protocol: 'file:', hostname: '', bridge });

      const result = await createPasskeys().create(creationOptions());

      expect(result.publicKeyCredential).toBeNull();
      expect(result.error).toMatchObject({ code: 'passkey_registration_cancelled' });
    });

    it('returns passkey_not_supported when no path is available', async () => {
      stubEnvironment({ protocol: 'file:', hostname: '', hasWebAuthn: false });

      const result = await createPasskeys().create(creationOptions());

      expect(result.publicKeyCredential).toBeNull();
      expect(result.error).toMatchObject({ code: 'passkey_not_supported' });
    });

    it('ignores the bridge on platforms without a native implementation', async () => {
      const bridge = makeBridge({ platform: 'linux' });
      stubEnvironment({ protocol: 'file:', hostname: '', bridge });

      const result = await createPasskeys().create(creationOptions());

      expect(bridge.create).not.toHaveBeenCalled();
      expect(result.error).toMatchObject({ code: 'passkey_not_supported' });
    });

    it('honors mode: native on a matching origin', async () => {
      const bridge = makeBridge();
      stubEnvironment({ bridge });

      await createPasskeys({ mode: 'native' }).create(creationOptions());

      expect(bridge.create).toHaveBeenCalled();
      expect(webAuthnCreateCredential).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('uses the renderer path on a matching https origin without conditional UI', async () => {
      stubEnvironment({ bridge: makeBridge() });
      const rendererResult = { publicKeyCredential: {} as never, error: null };
      vi.mocked(webAuthnGetCredential).mockResolvedValue(rendererResult);

      const result = await createPasskeys().get({ publicKeyOptions: requestOptions() });

      expect(webAuthnGetCredential).toHaveBeenCalledWith({
        publicKeyOptions: expect.anything(),
        conditionalUI: false,
      });
      expect(result).toBe(rendererResult);
    });

    it('uses the native path for local bundles', async () => {
      const bridge = makeBridge();
      stubEnvironment({ protocol: 'file:', hostname: '', bridge });

      const result = await createPasskeys().get({ publicKeyOptions: requestOptions() });

      expect(bridge.get).toHaveBeenCalledWith(expect.objectContaining({ rpId: 'example.com', challenge: 'AQID' }));
      expect(result.error).toBeNull();
      expect(result.publicKeyCredential?.toJSON()).toEqual(authenticationJSON);
    });

    it('retries natively when browser WebAuthn authentication is unsupported', async () => {
      const bridge = makeBridge();
      stubEnvironment({ protocol: 'http:', hostname: 'localhost', bridge });
      vi.mocked(webAuthnGetCredential).mockResolvedValue({
        publicKeyCredential: null,
        error: Object.assign(new Error('The user agent does not support public key credentials.'), {
          name: 'NotSupportedError',
        }),
      } as never);

      const result = await createPasskeys().get({ publicKeyOptions: requestOptionsForRpId('localhost') });

      expect(webAuthnGetCredential).toHaveBeenCalledWith({
        publicKeyOptions: expect.anything(),
        conditionalUI: false,
      });
      expect(bridge.get).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe('capability checks', () => {
    it('isSupported reflects either available path in auto mode', () => {
      stubEnvironment({ protocol: 'file:', hostname: '', hasWebAuthn: false, bridge: makeBridge() });
      expect(createPasskeys().isSupported()).toBe(true);

      stubEnvironment({ protocol: 'file:', hostname: '', hasWebAuthn: false });
      expect(createPasskeys().isSupported()).toBe(false);

      stubEnvironment({ hasWebAuthn: true });
      expect(createPasskeys().isSupported()).toBe(true);
    });

    it('isAutoFillSupported is false in native mode', async () => {
      stubEnvironment({ bridge: makeBridge() });

      await expect(createPasskeys({ mode: 'native' }).isAutoFillSupported()).resolves.toBe(false);
      await expect(createPasskeys().isAutoFillSupported()).resolves.toBe(true);
      expect(isWebAuthnAutofillSupported).toHaveBeenCalledTimes(1);
    });

    it('isPlatformAuthenticatorSupported prefers native capabilities when available', async () => {
      const bridge = makeBridge();
      stubEnvironment({ bridge });

      await expect(createPasskeys().isPlatformAuthenticatorSupported()).resolves.toBe(true);
      expect(bridge.capabilities).toHaveBeenCalled();
    });
  });
});

describe('createPasskeyProvider', () => {
  it('assigns the clerk-js passkey provider contract', () => {
    vi.stubGlobal('window', {});
    const clerk: ClerkPasskeyHost = {
      __internal_createPublicCredentials: undefined,
      __internal_getPublicCredentials: undefined,
      __internal_isWebAuthnSupported: undefined,
      __internal_isWebAuthnAutofillSupported: undefined,
      __internal_isWebAuthnPlatformAuthenticatorSupported: undefined,
    };

    const passkeys = createPasskeyProvider(clerk);

    expect(clerk.__internal_createPublicCredentials).toBe(passkeys.create);
    expect(clerk.__internal_getPublicCredentials).toBe(passkeys.get);
    expect(clerk.__internal_isWebAuthnSupported).toBe(passkeys.isSupported);
    expect(clerk.__internal_isWebAuthnAutofillSupported).toBe(passkeys.isAutoFillSupported);
    expect(clerk.__internal_isWebAuthnPlatformAuthenticatorSupported).toBe(passkeys.isPlatformAuthenticatorSupported);
    vi.unstubAllGlobals();
  });
});
