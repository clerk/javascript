import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { BiometricCredentialRecord } from '../types';

const mocks = vi.hoisted(() => ({
  nativeModule: null as Record<string, ReturnType<typeof vi.fn>> | null,
  requestedName: null as string | null,
}));

vi.mock('expo', () => ({
  requireOptionalNativeModule: (name: string) => {
    mocks.requestedName = name;
    return mocks.nativeModule;
  },
}));

const createNativeModule = () => ({
  getAppIdentifier: vi.fn().mockReturnValue('com.clerk.example'),
  getAvailability: vi.fn().mockResolvedValue({
    biometryType: 'faceID',
    canEvaluateBiometrics: true,
    canEvaluateDeviceOwner: true,
    errorCode: null,
  }),
  createKey: vi.fn().mockResolvedValue({ localKeyId: 'tdlk_1', publicKeyJwk: '{"kty":"EC"}' }),
  sign: vi.fn().mockResolvedValue('c2lnbmF0dXJl'),
  hasKey: vi.fn().mockResolvedValue(true),
  deleteKey: vi.fn().mockResolvedValue(undefined),
  listRecords: vi.fn().mockResolvedValue('[]'),
  saveRecord: vi.fn().mockResolvedValue(undefined),
  deleteRecord: vi.fn().mockResolvedValue(undefined),
  ensureInstallationMarker: vi.fn().mockResolvedValue({ wiped: false }),
});

const nativeError = (code: string, message = 'native failure') => Object.assign(new Error(message), { code });

const record: BiometricCredentialRecord = {
  id: 'tdc_1',
  localKeyId: 'tdlk_1',
  userId: 'user_1',
  appIdentifier: 'com.clerk.example',
  identifierHint: 'user@example.com',
  policy: 'biometry_current_set',
  createdAt: 1714000000500,
  updatedAt: 1714000001500,
};

const load = async () => import('../index.js');

describe('@clerk/expo-biometrics', () => {
  let native: ReturnType<typeof createNativeModule>;

  beforeEach(() => {
    vi.resetModules();
    native = createNativeModule();
    mocks.nativeModule = native;
    mocks.requestedName = null;
  });

  test('loads the ClerkExpoBiometrics native module', async () => {
    const biometrics = await load();

    expect(mocks.requestedName).toBe('ClerkExpoBiometrics');
    expect(biometrics.getAppIdentifier()).toBe('com.clerk.example');
    await expect(biometrics.getAvailability()).resolves.toEqual({
      biometryType: 'faceID',
      canEvaluateBiometrics: true,
      canEvaluateDeviceOwner: true,
      errorCode: null,
    });
  });

  test('rejects with native_module_unavailable when the native module is missing', async () => {
    mocks.nativeModule = null;
    const biometrics = await load();

    expect(() => biometrics.getAppIdentifier()).toThrow(
      expect.objectContaining({ name: 'ClerkBiometricsError', code: 'native_module_unavailable' }),
    );
    await expect(biometrics.getAvailability()).rejects.toMatchObject({ code: 'native_module_unavailable' });
    await expect(biometrics.listRecords()).rejects.toMatchObject({ code: 'native_module_unavailable' });
  });

  describe('keys', () => {
    test('createKey forwards the policy', async () => {
      const biometrics = await load();

      await expect(biometrics.createKey('biometry_or_device_passcode')).resolves.toEqual({
        localKeyId: 'tdlk_1',
        publicKeyJwk: '{"kty":"EC"}',
      });
      expect(native.createKey).toHaveBeenCalledWith('biometry_or_device_passcode');
    });

    test('createKey rejects unknown policies without calling native', async () => {
      const biometrics = await load();

      // @ts-expect-error testing an invalid policy
      await expect(biometrics.createKey('face_id')).rejects.toMatchObject({ code: 'invalid_argument' });
      expect(native.createKey).not.toHaveBeenCalled();
    });

    test('sign forwards arguments and defaults the reason to null', async () => {
      const biometrics = await load();

      await expect(biometrics.sign('tdlk_1', 'client-data', 'Sign in')).resolves.toBe('c2lnbmF0dXJl');
      await biometrics.sign('tdlk_1', 'client-data');

      expect(native.sign).toHaveBeenNthCalledWith(1, 'tdlk_1', 'client-data', 'Sign in');
      expect(native.sign).toHaveBeenNthCalledWith(2, 'tdlk_1', 'client-data', null);
    });

    test('sign validates its arguments', async () => {
      const biometrics = await load();

      await expect(biometrics.sign('', 'client-data')).rejects.toMatchObject({ code: 'invalid_argument' });
      // @ts-expect-error testing a non-string client data
      await expect(biometrics.sign('tdlk_1', 42)).rejects.toMatchObject({ code: 'invalid_argument' });
      expect(native.sign).not.toHaveBeenCalled();
    });

    test('hasKey and deleteKey forward the local key id', async () => {
      const biometrics = await load();

      await expect(biometrics.hasKey('tdlk_1')).resolves.toBe(true);
      await expect(biometrics.deleteKey('tdlk_1')).resolves.toBeUndefined();
      expect(native.hasKey).toHaveBeenCalledWith('tdlk_1');
      expect(native.deleteKey).toHaveBeenCalledWith('tdlk_1');
    });
  });

  describe('errors', () => {
    test.each([
      'user_canceled',
      'system_canceled',
      'user_fallback',
      'authentication_failed',
      'biometry_not_available',
      'biometry_not_enrolled',
      'biometry_lockout',
      'passcode_not_set',
      'key_not_found',
      'key_invalidated',
      'key_generation_failed',
      'signing_failed',
      'storage_failed',
      'not_implemented',
    ])('preserves the native %s code', async code => {
      native.sign.mockRejectedValueOnce(nativeError(code, 'details'));
      const biometrics = await load();

      const error = await biometrics.sign('tdlk_1', 'client-data').catch((e: unknown) => e);

      expect(biometrics.isClerkBiometricsError(error)).toBe(true);
      expect(error).toMatchObject({ code, message: 'details' });
      expect((error as Error).cause).toBeInstanceOf(Error);
    });

    test('maps unrecognized native codes to unknown', async () => {
      native.hasKey.mockRejectedValueOnce(nativeError('ERR_ARGUMENT_CAST'));
      const biometrics = await load();

      await expect(biometrics.hasKey('tdlk_1')).rejects.toMatchObject({ code: 'unknown' });
    });

    test('wraps synchronous native errors', async () => {
      native.getAppIdentifier.mockImplementationOnce(() => {
        throw nativeError('not_implemented');
      });
      const biometrics = await load();

      expect(() => biometrics.getAppIdentifier()).toThrow(expect.objectContaining({ code: 'not_implemented' }));
    });

    test('isBiometricsErrorCode recognizes known codes', async () => {
      const { isBiometricsErrorCode } = await load();

      expect(isBiometricsErrorCode('biometry_lockout')).toBe(true);
      expect(isBiometricsErrorCode('ERR_UNKNOWN')).toBe(false);
      expect(isBiometricsErrorCode(undefined)).toBe(false);
    });
  });

  describe('store', () => {
    test('listRecords parses native JSON and passes unknown fields through', async () => {
      native.listRecords.mockResolvedValueOnce(
        JSON.stringify([{ ...record, futureField: { nested: [1, true, null] } }]),
      );
      const biometrics = await load();

      const records = await biometrics.listRecords();

      expect(records).toEqual([{ ...record, futureField: { nested: [1, true, null] } }]);
    });

    test('listRecords rejects with storage_failed on invalid native output', async () => {
      native.listRecords.mockResolvedValueOnce('not json');
      native.listRecords.mockResolvedValueOnce('{}');
      const biometrics = await load();

      await expect(biometrics.listRecords()).rejects.toMatchObject({ code: 'storage_failed' });
      await expect(biometrics.listRecords()).rejects.toMatchObject({ code: 'storage_failed' });
    });

    test('saveRecord sends only contract fields', async () => {
      const biometrics = await load();

      await biometrics.saveRecord({ ...record, extra: 'dropped' } as BiometricCredentialRecord, {
        removeOtherRecordsForApp: true,
      });

      expect(native.saveRecord).toHaveBeenCalledWith(record, { removeOtherRecordsForApp: true });
    });

    test('saveRecord omits an absent identifier hint', async () => {
      const biometrics = await load();
      const { identifierHint: _, ...withoutHint } = record;

      await biometrics.saveRecord(withoutHint, { removeOtherRecordsForApp: false });

      expect(native.saveRecord.mock.calls[0][0]).not.toHaveProperty('identifierHint');
    });

    test.each<[string, Partial<Record<keyof BiometricCredentialRecord, unknown>>]>([
      ['an empty id', { id: '' }],
      ['a missing localKeyId', { localKeyId: undefined }],
      ['a non-string userId', { userId: 1 }],
      ['an empty appIdentifier', { appIdentifier: '' }],
      ['a non-string identifierHint', { identifierHint: 1 }],
      ['an unknown policy', { policy: 'face_id' }],
      ['a negative createdAt', { createdAt: -1 }],
      ['a non-finite updatedAt', { updatedAt: Number.NaN }],
      ['a string createdAt', { createdAt: '1714000000500' }],
    ])('saveRecord rejects %s', async (_, override) => {
      const biometrics = await load();

      await expect(
        biometrics.saveRecord({ ...record, ...override } as BiometricCredentialRecord, {
          removeOtherRecordsForApp: false,
        }),
      ).rejects.toMatchObject({ code: 'invalid_argument' });
      expect(native.saveRecord).not.toHaveBeenCalled();
    });

    test('saveRecord requires removeOtherRecordsForApp', async () => {
      const biometrics = await load();

      // @ts-expect-error testing missing options
      await expect(biometrics.saveRecord(record)).rejects.toMatchObject({ code: 'invalid_argument' });
    });

    test('deleteRecord and ensureInstallationMarker forward to native', async () => {
      native.ensureInstallationMarker.mockResolvedValueOnce({ wiped: true });
      const biometrics = await load();

      await biometrics.deleteRecord('tdlk_1');
      await expect(biometrics.ensureInstallationMarker()).resolves.toEqual({ wiped: true });

      expect(native.deleteRecord).toHaveBeenCalledWith('tdlk_1');
      await expect(biometrics.deleteRecord('')).rejects.toMatchObject({ code: 'invalid_argument' });
    });

    test('store errors keep their native code', async () => {
      native.saveRecord.mockRejectedValueOnce(nativeError('storage_failed'));
      const biometrics = await load();

      await expect(biometrics.saveRecord(record, { removeOtherRecordsForApp: false })).rejects.toMatchObject({
        code: 'storage_failed',
      });
    });
  });
});
