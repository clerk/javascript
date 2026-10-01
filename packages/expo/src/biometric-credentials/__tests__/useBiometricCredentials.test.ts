import { ClerkAPIResponseError } from '@clerk/shared/error';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { isBiometricCredentialError } from '../errors';
import type { ExpoBiometricsRecord } from '../loadExpoBiometrics';
import { useBiometricCredentials as useBiometricCredentialsOnUnsupportedPlatform } from '../useBiometricCredentials';
import { useBiometricCredentials as useBiometricCredentialsOnAndroid } from '../useBiometricCredentials.android';
import { useBiometricCredentials as useBiometricCredentialsOnIos } from '../useBiometricCredentials.ios';

const mocks = vi.hoisted(() => ({
  useClerk: vi.fn(),
  loadExpoBiometrics: vi.fn(),
  idle: vi.fn(),
  pullFromNative: vi.fn(),
  platform: { OS: 'ios' },
}));

vi.mock('@clerk/react', () => ({ useClerk: mocks.useClerk }));
vi.mock('../loadExpoBiometrics', () => ({ loadExpoBiometrics: mocks.loadExpoBiometrics }));
vi.mock('../../provider/nativeClientSyncCoordinator', () => ({
  waitForPendingJsToNativeSync: mocks.idle,
  synchronizeNativeClientToJs: mocks.pullFromNative,
}));
vi.mock('../../utils/native-module', () => ({ ClerkExpoModule: null }));
vi.mock('react-native', () => ({ Platform: mocks.platform }));

const APP_IDENTIFIER = 'com.example.app';

const moduleError = (code: string, message = code) => Object.assign(new Error(message), { code });

const asyncFn = <Args extends unknown[], Result>(implementation: (...args: Args) => Result) =>
  vi.fn((...args: Args) => Promise.resolve(implementation(...args)));

const hashHint = (hint: string) => `sha256(${hint})`;

function localRecord(overrides: Partial<ExpoBiometricsRecord> = {}): ExpoBiometricsRecord {
  return {
    id: 'td_1',
    localKeyId: 'key_1',
    userId: 'user_1',
    appIdentifier: APP_IDENTIFIER,
    policy: 'biometry_current_set',
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    identifierHintSha256: null,
    ...overrides,
  };
}

function createExpoBiometrics() {
  const store = {
    records: [] as ExpoBiometricsRecord[],
    keys: new Set<string>(),
  };
  const module = {
    store,
    getAppIdentifier: vi.fn(() => APP_IDENTIFIER),
    getAvailability: asyncFn(() => ({
      biometryType: 'faceID',
      canEvaluateBiometrics: true,
      canEvaluateDeviceOwner: true,
      errorCode: null,
      secureKeyStorageAvailable: true as boolean,
    })),
    createKey: asyncFn(() => {
      store.keys.add('key_new');
      return { localKeyId: 'key_new', publicKeyJwk: '{"kty":"EC","crv":"P-256","x":"x","y":"y","alg":"ES256"}' };
    }),
    sign: asyncFn(() => 'signature'),
    hasKey: asyncFn((localKeyId: string) => store.keys.has(localKeyId)),
    deleteKey: asyncFn((localKeyId: string) => {
      store.keys.delete(localKeyId);
    }),
    listRecords: asyncFn(() => store.records.map(record => ({ ...record }))),
    saveRecord: asyncFn((record: ExpoBiometricsRecord, options: { removeOtherRecordsForApp: boolean }) => {
      store.records = store.records.filter(
        existing =>
          existing.id !== record.id &&
          !(options.removeOtherRecordsForApp && existing.appIdentifier === record.appIdentifier),
      );
      store.records.push(record);
    }),
    deleteRecord: asyncFn((localKeyId: string) => {
      store.keys.delete(localKeyId);
      store.records = store.records.filter(record => record.localKeyId !== localKeyId);
    }),
    ensureInstallationMarker: asyncFn(() => ({ wiped: false })),
    hashIdentifierHint: vi.fn(hashHint),
  };
  return module;
}

function addLocalCredential(overrides: Partial<ExpoBiometricsRecord> = {}, { withKey = true } = {}) {
  const record = localRecord(overrides);
  biometrics.store.records.push(record);
  if (withKey) {
    biometrics.store.keys.add(record.localKeyId);
  }
  return record;
}

function serverCredential(overrides: Record<string, unknown> = {}) {
  return {
    id: 'td_1',
    platform: 'ios',
    appIdentifier: APP_IDENTIFIER,
    name: "Sean's iPhone",
    algorithm: 'ES256',
    status: 'active',
    createdAt: new Date(1_700_000_000_000),
    updatedAt: new Date(1_700_000_100_000),
    lastUsedAt: null,
    revokedAt: null,
    ...overrides,
  };
}

function apiError(code: string, paramName?: string) {
  return new ClerkAPIResponseError(code, {
    data: [
      {
        code,
        message: `${code} message`,
        long_message: `${code} long message`,
        meta: paramName ? { param_name: paramName } : {},
      },
    ],
    status: 422,
  });
}

async function expectBiometricApiError(operation: Promise<unknown>, cause: ClerkAPIResponseError) {
  const error = await operation.then(
    () => expect.unreachable('Expected the operation to reject'),
    (rejection: unknown) => rejection,
  );
  const code = cause.errors[0].code;
  expect(isBiometricCredentialError(error)).toBe(true);
  expect(error).not.toBeInstanceOf(ClerkAPIResponseError);
  expect(error).toMatchObject({ code, message: `${code} long message`, cause });
}

function trustedDeviceVerification(challengeOverrides: Record<string, unknown> = {}) {
  return {
    strategy: 'trusted_device',
    trustedDeviceChallenge: {
      challenge: 'challenge',
      challengeId: 'challenge_1',
      trustedDeviceId: 'td_1',
      clientData: 'reverification-client-data',
      expiresAt: null as Date | null,
      algorithm: 'ES256',
      ...challengeOverrides,
    },
  };
}

function sessionVerification(status: string, overrides: Record<string, unknown> = {}) {
  return {
    id: 'sessver_1',
    status,
    level: 'multi_factor',
    firstFactorVerification: null as unknown,
    secondFactorVerification: null as unknown,
    ...overrides,
  };
}

function createClerk() {
  const user = {
    id: 'user_1',
    __experimental_getBiometricCredentials: asyncFn(() => [serverCredential()]),
    __experimental_prepareBiometricCredential: asyncFn(() => ({
      challenge: 'challenge',
      challengeId: 'challenge_1',
      trustedDeviceId: null,
      clientData: 'enrollment-client-data',
      expiresAt: null,
      algorithm: 'ES256',
    })),
    __experimental_attemptBiometricCredential: asyncFn(() => serverCredential({ id: 'td_new' })),
    __experimental_revokeBiometricCredential: asyncFn((id: string) =>
      serverCredential({ id, status: 'revoked', revokedAt: new Date(1_700_000_300_000) }),
    ),
  };
  const completedSignIn = { id: 'sia_1', status: 'complete', createdSessionId: 'sess_new' };
  const createdSignIn = {
    id: 'sia_1',
    status: 'needs_first_factor',
    createdSessionId: null,
    firstFactorVerification: { trustedDeviceChallenge: { clientData: 'sign-in-client-data' } },
    attemptFirstFactor: asyncFn(() => completedSignIn),
  };
  const clientSignIn = { create: asyncFn(() => createdSignIn) };
  const session = {
    id: 'sess_1',
    status: 'active',
    user,
    startVerification: asyncFn(() => sessionVerification('needs_first_factor')),
    prepareFirstFactorVerification: asyncFn(() =>
      sessionVerification('needs_first_factor', { firstFactorVerification: trustedDeviceVerification() }),
    ),
    attemptFirstFactorVerification: asyncFn(() => sessionVerification('complete')),
    prepareSecondFactorVerification: asyncFn(() =>
      sessionVerification('needs_second_factor', { secondFactorVerification: trustedDeviceVerification() }),
    ),
    attemptSecondFactorVerification: asyncFn(() => sessionVerification('complete')),
    clearCache: vi.fn(),
    getToken: asyncFn((): string | null => 'fresh-token'),
  };
  return {
    user,
    session,
    createdSignIn,
    completedSignIn,
    clientSignIn,
    instance: {
      __internal_environment: {
        authConfig: { nativeSettings: { apiEnabled: true, trustedDeviceSignInEnabled: true } },
      } as { authConfig: { nativeSettings: { apiEnabled: boolean; trustedDeviceSignInEnabled: boolean } | null } },
      session: null as typeof session | null,
      user: null as typeof user | null,
      client: { signIn: clientSignIn } as { signIn: typeof clientSignIn } | undefined,
      setActive: vi.fn(),
    },
  };
}

let biometrics: ReturnType<typeof createExpoBiometrics>;
let clerk: ReturnType<typeof createClerk>;

function signInClerkUser(status = 'active') {
  clerk.session.status = status;
  clerk.instance.session = clerk.session;
  clerk.instance.user = clerk.user;
}

function renderBiometricCredentials(useHook = useBiometricCredentialsOnIos) {
  return renderHook(() => useHook()).result.current;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.platform.OS = 'ios';
  biometrics = createExpoBiometrics();
  clerk = createClerk();
  mocks.loadExpoBiometrics.mockImplementation(() => biometrics);
  mocks.useClerk.mockImplementation(() => clerk.instance);
});

describe('getAvailability', () => {
  test.each([
    ['environment_unavailable', null],
    ['native_api_disabled', { apiEnabled: false, trustedDeviceSignInEnabled: true }],
    ['feature_disabled', { apiEnabled: true, trustedDeviceSignInEnabled: false }],
  ] as const)('reports %s from the environment before reading local records', async (reason, nativeSettings) => {
    clerk.instance.__internal_environment.authConfig.nativeSettings = nativeSettings;
    addLocalCredential();

    await expect(renderBiometricCredentials().getAvailability()).resolves.toEqual({
      isAvailable: false,
      unavailableReason: reason,
    });
    expect(biometrics.listRecords).not.toHaveBeenCalled();
  });

  test('reports biometric authentication unavailable without secure key storage, before reading local records', async () => {
    addLocalCredential();
    biometrics.getAvailability.mockResolvedValue({
      biometryType: 'faceID',
      canEvaluateBiometrics: true,
      canEvaluateDeviceOwner: true,
      errorCode: null,
      secureKeyStorageAvailable: false,
    });

    await expect(renderBiometricCredentials().getAvailability()).resolves.toEqual({
      isAvailable: false,
      unavailableReason: 'biometric_authentication_unavailable',
    });
    expect(biometrics.listRecords).not.toHaveBeenCalled();
    expect(biometrics.hasKey).not.toHaveBeenCalled();
    expect(biometrics.deleteRecord).not.toHaveBeenCalled();
    expect(biometrics.store.records).toHaveLength(1);
  });

  test('reports no local credential when the device has none for this app', async () => {
    addLocalCredential({ appIdentifier: 'com.example.other' });

    await expect(renderBiometricCredentials().getAvailability()).resolves.toEqual({
      isAvailable: false,
      unavailableReason: 'no_local_credential',
    });
  });

  test('is available for a signed-out user with a usable local credential', async () => {
    addLocalCredential();

    await expect(renderBiometricCredentials().getAvailability()).resolves.toEqual({
      isAvailable: true,
      unavailableReason: null,
    });
    expect(clerk.user.__experimental_getBiometricCredentials).not.toHaveBeenCalled();
  });

  test('filters by credential ID', async () => {
    addLocalCredential();
    const biometricCredentials = renderBiometricCredentials();

    await expect(biometricCredentials.getAvailability({ id: 'td_1' })).resolves.toMatchObject({ isAvailable: true });
    await expect(biometricCredentials.getAvailability({ id: 'td_other' })).resolves.toEqual({
      isAvailable: false,
      unavailableReason: 'no_local_credential',
    });
  });

  test('matches the identifier hint by its normalized hash', async () => {
    addLocalCredential({ identifierHintSha256: hashHint('sean@example.com') });
    const biometricCredentials = renderBiometricCredentials();

    await expect(
      biometricCredentials.getAvailability({ identifierHint: '  Sean@Example.com ' }),
    ).resolves.toMatchObject({ isAvailable: true });
    expect(biometrics.hashIdentifierHint).toHaveBeenCalledWith('sean@example.com');
    await expect(biometricCredentials.getAvailability({ identifierHint: 'other@example.com' })).resolves.toEqual({
      isAvailable: false,
      unavailableReason: 'no_local_credential',
    });
  });

  test('ignores a blank identifier hint', async () => {
    addLocalCredential({ identifierHintSha256: hashHint('sean@example.com') });

    await expect(renderBiometricCredentials().getAvailability({ identifierHint: '   ' })).resolves.toMatchObject({
      isAvailable: true,
    });
    expect(biometrics.hashIdentifierHint).not.toHaveBeenCalled();
  });

  test('prunes local records whose key is missing', async () => {
    addLocalCredential({ id: 'td_orphan', localKeyId: 'key_orphan' }, { withKey: false });

    await expect(renderBiometricCredentials().getAvailability()).resolves.toEqual({
      isAvailable: false,
      unavailableReason: 'local_key_missing',
    });
    expect(biometrics.deleteRecord).toHaveBeenCalledWith('key_orphan');
    expect(biometrics.store.records).toEqual([]);
  });

  test('keeps usable records while pruning the ones without a key', async () => {
    addLocalCredential({ id: 'td_orphan', localKeyId: 'key_orphan' }, { withKey: false });
    addLocalCredential();

    await expect(renderBiometricCredentials().getAvailability()).resolves.toMatchObject({ isAvailable: true });
    expect(biometrics.store.records.map(record => record.id)).toEqual(['td_1']);
  });

  test('reports biometric authentication unavailable when no record policy can be evaluated', async () => {
    addLocalCredential();
    biometrics.getAvailability.mockResolvedValue({
      biometryType: 'none',
      canEvaluateBiometrics: false,
      canEvaluateDeviceOwner: true,
      errorCode: null,
      secureKeyStorageAvailable: true,
    });

    await expect(renderBiometricCredentials().getAvailability()).resolves.toEqual({
      isAvailable: false,
      unavailableReason: 'biometric_authentication_unavailable',
    });
  });

  test('allows passcode-backed records when only device owner authentication is available', async () => {
    addLocalCredential({ policy: 'biometry_or_device_passcode' });
    biometrics.getAvailability.mockResolvedValue({
      biometryType: 'none',
      canEvaluateBiometrics: false,
      canEvaluateDeviceOwner: true,
      errorCode: null,
      secureKeyStorageAvailable: true,
    });

    await expect(renderBiometricCredentials().getAvailability()).resolves.toMatchObject({ isAvailable: true });
  });

  describe('with an active session', () => {
    beforeEach(() => {
      signInClerkUser();
    });

    test('is available when the server credential is active', async () => {
      addLocalCredential();

      await expect(renderBiometricCredentials().getAvailability()).resolves.toEqual({
        isAvailable: true,
        unavailableReason: null,
      });
      expect(clerk.user.__experimental_getBiometricCredentials).toHaveBeenCalledOnce();
    });

    test('only considers records enrolled by the active user', async () => {
      addLocalCredential({ userId: 'user_other' });

      await expect(renderBiometricCredentials().getAvailability()).resolves.toEqual({
        isAvailable: false,
        unavailableReason: 'no_local_credential',
      });
      expect(clerk.user.__experimental_getBiometricCredentials).not.toHaveBeenCalled();
    });

    test('deletes a local record the server no longer has', async () => {
      addLocalCredential();
      clerk.user.__experimental_getBiometricCredentials.mockResolvedValue([]);

      await expect(renderBiometricCredentials().getAvailability()).resolves.toEqual({
        isAvailable: false,
        unavailableReason: 'server_credential_missing',
      });
      expect(biometrics.deleteRecord).toHaveBeenCalledWith('key_1');
    });

    test('deletes a local record whose server credential is revoked', async () => {
      addLocalCredential();
      clerk.user.__experimental_getBiometricCredentials.mockResolvedValue([serverCredential({ status: 'revoked' })]);

      await expect(renderBiometricCredentials().getAvailability()).resolves.toEqual({
        isAvailable: false,
        unavailableReason: 'server_credential_revoked',
      });
      expect(biometrics.store.records).toEqual([]);
    });

    test('falls through to an older record that is still active on the server', async () => {
      addLocalCredential({ id: 'td_old', localKeyId: 'key_old', createdAt: 1 });
      addLocalCredential({ id: 'td_new', localKeyId: 'key_new', createdAt: 2 });
      clerk.user.__experimental_getBiometricCredentials.mockResolvedValue([serverCredential({ id: 'td_old' })]);

      await expect(renderBiometricCredentials().getAvailability()).resolves.toMatchObject({ isAvailable: true });
      expect(biometrics.store.records.map(record => record.id)).toEqual(['td_old']);
    });

    test('does not reconcile a pending session', async () => {
      signInClerkUser('pending');
      addLocalCredential();

      await expect(renderBiometricCredentials().getAvailability()).resolves.toMatchObject({ isAvailable: true });
      expect(clerk.user.__experimental_getBiometricCredentials).not.toHaveBeenCalled();
    });

    test('surfaces server errors unchanged', async () => {
      addLocalCredential();
      const error = apiError('session_reverification_required');
      clerk.user.__experimental_getBiometricCredentials.mockRejectedValue(error);

      await expectBiometricApiError(renderBiometricCredentials().getAvailability(), error);
      expect(biometrics.store.records).toHaveLength(1);
    });
  });

  test('maps module failures to the operation error code', async () => {
    biometrics.listRecords.mockRejectedValue(moduleError('storage_failed', 'Keychain unavailable'));

    const operation = renderBiometricCredentials().getAvailability();

    await expect(operation).rejects.toMatchObject({
      code: 'E_TRUSTED_DEVICE_AVAILABILITY_FAILED',
      message: 'Keychain unavailable',
    });
  });
});

describe('list', () => {
  test('lists the signed-in user credentials', async () => {
    signInClerkUser();
    clerk.user.__experimental_getBiometricCredentials.mockResolvedValue([
      serverCredential({ lastUsedAt: new Date(1_700_000_200_000) }),
    ]);

    await expect(renderBiometricCredentials().list()).resolves.toEqual([
      {
        id: 'td_1',
        object: 'trusted_device',
        platform: 'ios',
        appIdentifier: APP_IDENTIFIER,
        name: "Sean's iPhone",
        algorithm: 'ES256',
        status: 'active',
        createdAt: new Date(1_700_000_000_000),
        updatedAt: new Date(1_700_000_100_000),
        lastUsedAt: new Date(1_700_000_200_000),
        revokedAt: null,
      },
    ]);
  });

  test('normalizes unknown resource values', async () => {
    signInClerkUser();
    clerk.user.__experimental_getBiometricCredentials.mockResolvedValue([
      serverCredential({ platform: 'visionos', algorithm: 'ES384', status: 'pending_review', lastUsedAt: undefined }),
    ]);

    const [credential] = await renderBiometricCredentials().list();

    expect(credential).toMatchObject({ platform: 'unknown', algorithm: 'ES384', status: 'unknown', lastUsedAt: null });
  });

  test('requires a signed-in user', async () => {
    await expect(renderBiometricCredentials().list()).rejects.toMatchObject({ code: 'E_TRUSTED_DEVICE_LIST_FAILED' });
  });
});

describe('enroll', () => {
  beforeEach(() => {
    signInClerkUser();
  });

  test('creates a key, completes the server enrollment and saves the local record', async () => {
    const credential = await renderBiometricCredentials().enroll({
      name: "Sean's iPhone",
      identifierHint: ' Sean@Example.com ',
      reason: 'Use Face ID to trust this device.',
    });

    const publicKeyJwk = '{"kty":"EC","crv":"P-256","x":"x","y":"y","alg":"ES256"}';
    expect(biometrics.createKey).toHaveBeenCalledWith('biometry_current_set');
    expect(clerk.user.__experimental_prepareBiometricCredential).toHaveBeenCalledWith({
      platform: 'ios',
      appIdentifier: APP_IDENTIFIER,
      name: "Sean's iPhone",
      algorithm: 'ES256',
      publicKeyJwk,
    });
    expect(biometrics.sign).toHaveBeenCalledWith(
      'key_new',
      'enrollment-client-data',
      'Use Face ID to trust this device.',
    );
    expect(clerk.user.__experimental_attemptBiometricCredential).toHaveBeenCalledWith({
      platform: 'ios',
      appIdentifier: APP_IDENTIFIER,
      name: "Sean's iPhone",
      algorithm: 'ES256',
      publicKeyJwk,
      clientData: 'enrollment-client-data',
      signature: 'signature',
    });
    expect(biometrics.saveRecord).toHaveBeenCalledWith(
      {
        id: 'td_new',
        localKeyId: 'key_new',
        userId: 'user_1',
        appIdentifier: APP_IDENTIFIER,
        identifierHint: 'sean@example.com',
        policy: 'biometry_current_set',
        createdAt: 1_700_000_000_000,
        updatedAt: 1_700_000_100_000,
      },
      { removeOtherRecordsForApp: true },
    );
    expect(credential).toMatchObject({ id: 'td_new', object: 'trusted_device', status: 'active' });
  });

  test('replaces the other local records for the app', async () => {
    addLocalCredential({ id: 'td_old', localKeyId: 'key_old', userId: 'user_other' });

    await renderBiometricCredentials().enroll();

    expect(biometrics.store.records.map(record => record.id)).toEqual(['td_new']);
  });

  test('uses the requested policy, platform and default prompt', async () => {
    mocks.platform.OS = 'android';

    await renderBiometricCredentials(useBiometricCredentialsOnAndroid).enroll({
      policy: 'biometry_or_device_passcode',
    });

    expect(biometrics.createKey).toHaveBeenCalledWith('biometry_or_device_passcode');
    expect(clerk.user.__experimental_prepareBiometricCredential).toHaveBeenCalledWith(
      expect.not.objectContaining({ name: expect.anything() }),
    );
    expect(clerk.user.__experimental_prepareBiometricCredential).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'android' }),
    );
    expect(biometrics.sign).toHaveBeenCalledWith(
      'key_new',
      'enrollment-client-data',
      'Use biometrics to enroll this device.',
    );
    expect(biometrics.saveRecord).toHaveBeenCalledWith(
      expect.not.objectContaining({ identifierHint: expect.anything() }),
      { removeOtherRecordsForApp: true },
    );
  });

  test('requires an active or pending session', async () => {
    clerk.instance.session = null;

    await expect(renderBiometricCredentials().enroll()).rejects.toMatchObject({
      code: 'E_TRUSTED_DEVICE_ENROLLMENT_FAILED',
    });
    expect(biometrics.createKey).not.toHaveBeenCalled();
  });

  test('enrolls with a pending session', async () => {
    signInClerkUser('pending');

    await expect(renderBiometricCredentials().enroll()).resolves.toMatchObject({ id: 'td_new' });
  });

  test('requires the feature to be enabled', async () => {
    clerk.instance.__internal_environment.authConfig.nativeSettings = {
      apiEnabled: true,
      trustedDeviceSignInEnabled: false,
    };

    await expect(renderBiometricCredentials().enroll()).rejects.toMatchObject({
      code: 'E_TRUSTED_DEVICE_ENROLLMENT_FAILED',
    });
    expect(biometrics.createKey).not.toHaveBeenCalled();
  });

  test('maps key creation failures without calling the server', async () => {
    biometrics.createKey.mockRejectedValue(moduleError('biometry_not_enrolled'));

    await expect(renderBiometricCredentials().enroll()).rejects.toMatchObject({
      code: 'biometric_authentication_unavailable',
    });
    expect(clerk.user.__experimental_prepareBiometricCredential).not.toHaveBeenCalled();
  });

  test('fails fast when the device has no secure key storage', async () => {
    biometrics.createKey.mockRejectedValue(moduleError('secure_key_storage_unavailable', 'No Secure Enclave'));

    await expect(renderBiometricCredentials().enroll()).rejects.toMatchObject({
      code: 'biometric_authentication_unavailable',
      message: 'No Secure Enclave',
    });
    expect(clerk.user.__experimental_prepareBiometricCredential).not.toHaveBeenCalled();
    expect(biometrics.sign).not.toHaveBeenCalled();
    expect(biometrics.saveRecord).not.toHaveBeenCalled();
  });

  test('surfaces reverification errors from prepare unchanged and deletes the key', async () => {
    const error = apiError('session_reverification_required');
    clerk.user.__experimental_prepareBiometricCredential.mockRejectedValue(error);

    await expectBiometricApiError(renderBiometricCredentials().enroll(), error);
    expect(biometrics.deleteKey).toHaveBeenCalledWith('key_new');
    expect(biometrics.sign).not.toHaveBeenCalled();
    expect(biometrics.saveRecord).not.toHaveBeenCalled();
  });

  test('deletes the key when signing is canceled', async () => {
    biometrics.sign.mockRejectedValue(moduleError('user_canceled'));

    await expect(renderBiometricCredentials().enroll()).rejects.toMatchObject({
      code: 'biometric_authentication_canceled',
    });
    expect(biometrics.deleteKey).toHaveBeenCalledWith('key_new');
    expect(clerk.user.__experimental_attemptBiometricCredential).not.toHaveBeenCalled();
  });

  test('deletes the key when the server rejects the attempt', async () => {
    const error = apiError('form_param_invalid', 'signature');
    clerk.user.__experimental_attemptBiometricCredential.mockRejectedValue(error);

    await expectBiometricApiError(renderBiometricCredentials().enroll(), error);
    expect(biometrics.deleteKey).toHaveBeenCalledWith('key_new');
    expect(biometrics.saveRecord).not.toHaveBeenCalled();
    expect(clerk.user.__experimental_revokeBiometricCredential).not.toHaveBeenCalled();
  });

  test('revokes the server credential and deletes the key when the record cannot be saved', async () => {
    biometrics.saveRecord.mockRejectedValue(moduleError('storage_failed', 'Keychain write failed'));

    await expect(renderBiometricCredentials().enroll()).rejects.toMatchObject({
      code: 'E_TRUSTED_DEVICE_ENROLLMENT_FAILED',
      message: 'Keychain write failed',
    });
    expect(clerk.user.__experimental_revokeBiometricCredential).toHaveBeenCalledWith('td_new');
    expect(biometrics.deleteKey).toHaveBeenCalledWith('key_new');
  });

  test('keeps the save error when cleanup also fails', async () => {
    biometrics.saveRecord.mockRejectedValue(moduleError('storage_failed'));
    clerk.user.__experimental_revokeBiometricCredential.mockRejectedValue(new Error('offline'));
    biometrics.deleteKey.mockRejectedValue(moduleError('unknown'));

    await expect(renderBiometricCredentials().enroll()).rejects.toMatchObject({
      code: 'E_TRUSTED_DEVICE_ENROLLMENT_FAILED',
    });
  });
});

describe('revoke', () => {
  beforeEach(() => {
    signInClerkUser();
  });

  test('revokes on the server, then deletes the matching local credential', async () => {
    addLocalCredential();
    addLocalCredential({ id: 'td_other', localKeyId: 'key_other' });

    const credential = await renderBiometricCredentials().revoke('td_1');

    expect(clerk.user.__experimental_revokeBiometricCredential).toHaveBeenCalledWith('td_1');
    expect(biometrics.deleteRecord).toHaveBeenCalledWith('key_1');
    expect(biometrics.store.records.map(record => record.id)).toEqual(['td_other']);
    expect(credential).toMatchObject({ id: 'td_1', status: 'revoked', revokedAt: new Date(1_700_000_300_000) });
  });

  test('keeps local state when the server revocation fails', async () => {
    addLocalCredential();
    const error = apiError('session_reverification_required');
    clerk.user.__experimental_revokeBiometricCredential.mockRejectedValue(error);

    await expectBiometricApiError(renderBiometricCredentials().revoke('td_1'), error);
    expect(biometrics.deleteRecord).not.toHaveBeenCalled();
  });

  test('returns the revoked credential when local cleanup fails', async () => {
    addLocalCredential();
    biometrics.deleteRecord.mockRejectedValue(moduleError('storage_failed'));

    await expect(renderBiometricCredentials().revoke('td_1')).resolves.toMatchObject({ status: 'revoked' });
  });
});

describe('signIn', () => {
  test('signs the trusted device challenge and returns the completed sign-in', async () => {
    addLocalCredential();

    const result = await renderBiometricCredentials().signIn({ reason: 'Use Face ID to sign in.' });

    expect(clerk.clientSignIn.create).toHaveBeenCalledWith({ strategy: 'trusted_device', trustedDeviceId: 'td_1' });
    expect(biometrics.sign).toHaveBeenCalledWith('key_1', 'sign-in-client-data', 'Use Face ID to sign in.');
    expect(clerk.createdSignIn.attemptFirstFactor).toHaveBeenCalledWith({
      strategy: 'trusted_device',
      trustedDeviceId: 'td_1',
      clientData: 'sign-in-client-data',
      signature: 'signature',
      algorithm: 'ES256',
    });
    expect(result).toEqual({
      status: 'complete',
      createdSessionId: 'sess_new',
      signIn: clerk.completedSignIn,
      setActive: clerk.instance.setActive,
    });
    expect(clerk.instance.setActive).not.toHaveBeenCalled();
    expect(mocks.idle).not.toHaveBeenCalled();
    expect(mocks.pullFromNative).not.toHaveBeenCalled();
  });

  test('uses the default prompt and the newest matching credential', async () => {
    addLocalCredential({ id: 'td_old', localKeyId: 'key_old', createdAt: 1 });
    addLocalCredential({ id: 'td_new', localKeyId: 'key_new', createdAt: 2 });

    await renderBiometricCredentials().signIn();

    expect(clerk.clientSignIn.create).toHaveBeenCalledWith({ strategy: 'trusted_device', trustedDeviceId: 'td_new' });
    expect(biometrics.sign).toHaveBeenCalledWith('key_new', 'sign-in-client-data', 'Use biometrics to sign in.');
  });

  test('selects the credential matching the identifier hint', async () => {
    addLocalCredential({ id: 'td_sean', localKeyId: 'key_sean', identifierHintSha256: hashHint('sean@example.com') });
    addLocalCredential({
      id: 'td_ana',
      localKeyId: 'key_ana',
      createdAt: 2,
      identifierHintSha256: hashHint('ana@x.co'),
    });

    await renderBiometricCredentials().signIn({ identifierHint: 'Sean@example.com' });

    expect(clerk.clientSignIn.create).toHaveBeenCalledWith({ strategy: 'trusted_device', trustedDeviceId: 'td_sean' });
  });

  test.each(['needs_second_factor', 'needs_client_trust', 'needs_new_password'])(
    'returns a continuable sign-in for %s',
    async status => {
      addLocalCredential();
      const continuable = { id: 'sia_1', status, createdSessionId: null, prepareSecondFactor: vi.fn() };
      clerk.createdSignIn.attemptFirstFactor.mockResolvedValue(continuable as never);

      await expect(renderBiometricCredentials().signIn()).resolves.toMatchObject({
        status,
        createdSessionId: null,
        signIn: continuable,
      });
    },
  );

  test('rejects without contacting the server when no local credential is available', async () => {
    const operation = renderBiometricCredentials().signIn();

    await expect(operation).rejects.toMatchObject({ code: 'E_TRUSTED_DEVICE_SIGN_IN_FAILED' });
    await expect(operation).rejects.toThrow('no_local_credential');
    expect(clerk.clientSignIn.create).not.toHaveBeenCalled();
  });

  test('rejects without contacting the server when the device has no secure key storage', async () => {
    addLocalCredential();
    biometrics.getAvailability.mockResolvedValue({
      biometryType: 'faceID',
      canEvaluateBiometrics: true,
      canEvaluateDeviceOwner: true,
      errorCode: null,
      secureKeyStorageAvailable: false,
    });

    const operation = renderBiometricCredentials().signIn();

    await expect(operation).rejects.toThrow('biometric_authentication_unavailable');
    expect(clerk.clientSignIn.create).not.toHaveBeenCalled();
    expect(biometrics.sign).not.toHaveBeenCalled();
  });

  test('rejects when the Clerk client is unavailable', async () => {
    addLocalCredential();
    clerk.instance.client = undefined;

    await expect(renderBiometricCredentials().signIn()).rejects.toThrow('client sign-in resource is unavailable');
  });

  test('rejects when the server does not return a challenge', async () => {
    addLocalCredential();
    clerk.createdSignIn.firstFactorVerification.trustedDeviceChallenge = undefined as never;

    await expect(renderBiometricCredentials().signIn()).rejects.toThrow('did not return a challenge');
    expect(biometrics.sign).not.toHaveBeenCalled();
  });

  test.each(['form_resource_not_found', 'trusted_device_not_registered'])(
    'forgets the local credential when sign-in creation fails with %s',
    async code => {
      addLocalCredential();
      const error = apiError(code, 'trusted_device_id');
      clerk.clientSignIn.create.mockRejectedValue(error);

      await expectBiometricApiError(renderBiometricCredentials().signIn(), error);
      expect(biometrics.deleteRecord).toHaveBeenCalledWith('key_1');
      expect(biometrics.store.records).toEqual([]);
    },
  );

  test('forgets the local credential when the attempt reports it missing', async () => {
    addLocalCredential();
    const error = apiError('trusted_device_not_registered', 'trusted_device_id');
    clerk.createdSignIn.attemptFirstFactor.mockRejectedValue(error);

    await expectBiometricApiError(renderBiometricCredentials().signIn(), error);
    expect(biometrics.store.records).toEqual([]);
  });

  test('keeps the local credential for unrelated server errors', async () => {
    addLocalCredential();
    const error = apiError('form_resource_not_found', 'sign_in_id');
    clerk.createdSignIn.attemptFirstFactor.mockRejectedValue(error);

    await expectBiometricApiError(renderBiometricCredentials().signIn(), error);
    expect(biometrics.deleteRecord).not.toHaveBeenCalled();
  });

  test.each(['key_invalidated', 'key_not_found'])(
    'forgets the local credential when signing fails with %s',
    async code => {
      addLocalCredential();
      biometrics.sign.mockRejectedValue(moduleError(code));

      const operation = renderBiometricCredentials().signIn();

      await expect(operation).rejects.toMatchObject({ code });
      expect(biometrics.deleteRecord).toHaveBeenCalledWith('key_1');
      expect(clerk.createdSignIn.attemptFirstFactor).not.toHaveBeenCalled();
    },
  );

  test('keeps the local credential when the prompt is canceled', async () => {
    addLocalCredential();
    biometrics.sign.mockRejectedValue(moduleError('user_canceled', 'Canceled'));

    const operation = renderBiometricCredentials().signIn();

    await expect(operation).rejects.toMatchObject({ code: 'biometric_authentication_canceled', message: 'Canceled' });
    await operation.catch(error => {
      expect(isBiometricCredentialError(error)).toBe(true);
    });
    expect(biometrics.deleteRecord).not.toHaveBeenCalled();
  });

  test('reconciles with the server when a user is already signed in', async () => {
    signInClerkUser();
    addLocalCredential();
    clerk.user.__experimental_getBiometricCredentials.mockResolvedValue([]);

    await expect(renderBiometricCredentials().signIn()).rejects.toThrow('server_credential_missing');
    expect(biometrics.store.records).toEqual([]);
    expect(clerk.clientSignIn.create).not.toHaveBeenCalled();
  });
});

describe('API errors', () => {
  test('surface a reverification-required error with its API code', async () => {
    signInClerkUser();
    clerk.user.__experimental_prepareBiometricCredential.mockRejectedValue(apiError('session_reverification_required'));

    const operation = renderBiometricCredentials().enroll();

    await expect(operation).rejects.toMatchObject({ code: 'session_reverification_required' });
    await operation.catch(error => expect(isBiometricCredentialError(error)).toBe(true));
  });

  test('surface a trusted_device_not_registered error with its API code', async () => {
    addLocalCredential();
    clerk.clientSignIn.create.mockRejectedValue(apiError('trusted_device_not_registered', 'trusted_device_id'));

    const operation = renderBiometricCredentials().signIn();

    await expect(operation).rejects.toMatchObject({
      code: 'trusted_device_not_registered',
      message: 'trusted_device_not_registered long message',
    });
    await operation.catch(error => expect(isBiometricCredentialError(error)).toBe(true));
  });

  test('fall back to the short message and the operation code', async () => {
    signInClerkUser();
    const withoutLongMessage = new ClerkAPIResponseError('native_api_disabled', {
      data: [{ code: 'native_api_disabled', message: 'Native API is disabled', long_message: undefined as never }],
      status: 403,
    });
    clerk.user.__experimental_getBiometricCredentials.mockRejectedValueOnce(withoutLongMessage);
    clerk.user.__experimental_getBiometricCredentials.mockRejectedValueOnce(new Error('Network down'));
    const biometricCredentials = renderBiometricCredentials();

    await expect(biometricCredentials.list()).rejects.toMatchObject({
      code: 'native_api_disabled',
      message: 'Native API is disabled',
    });
    await expect(biometricCredentials.list()).rejects.toMatchObject({
      code: 'E_TRUSTED_DEVICE_LIST_FAILED',
      message: 'Network down',
    });
  });
});

describe('missing @clerk/expo-biometrics', () => {
  test.each(['getAvailability', 'list', 'enroll', 'revoke', 'signIn'] as const)(
    '%s explains how to install the package',
    async method => {
      mocks.loadExpoBiometrics.mockReturnValue(null);
      const biometricCredentials = renderBiometricCredentials();

      await expect((biometricCredentials[method] as (arg?: string) => Promise<unknown>)('td_1')).rejects.toThrow(
        'Biometric credentials require the @clerk/expo-biometrics package. Install it with `npx expo install @clerk/expo-biometrics`',
      );
    },
  );

  test('explains that the development build must include the native module', async () => {
    biometrics.getAppIdentifier.mockImplementation(() => {
      throw moduleError('native_module_unavailable');
    });

    await expect(renderBiometricCredentials().signIn()).rejects.toThrow(
      'Biometric credentials require a development build that includes @clerk/expo-biometrics',
    );
  });
});

describe('useBiometricCredentials', () => {
  test.each([
    ['iOS', useBiometricCredentialsOnIos],
    ['Android', useBiometricCredentialsOnAndroid],
    ['an unsupported platform', useBiometricCredentialsOnUnsupportedPlatform],
  ])('returns stable operation identities on %s', (_, useHook) => {
    const { result, rerender } = renderHook(() => useHook());
    const initial = result.current;

    rerender();

    expect(result.current).toBe(initial);
  });

  test('reports unsupported availability on unsupported platforms without loading the module', async () => {
    const biometricCredentials = renderBiometricCredentials(useBiometricCredentialsOnUnsupportedPlatform);

    await expect(biometricCredentials.getAvailability()).resolves.toEqual({
      isAvailable: false,
      unavailableReason: 'unsupported_platform',
    });
    expect(mocks.loadExpoBiometrics).not.toHaveBeenCalled();
  });

  test('rejects operations on unsupported platforms', async () => {
    const biometricCredentials = renderBiometricCredentials(useBiometricCredentialsOnUnsupportedPlatform);

    await expect(biometricCredentials.enroll()).rejects.toThrow(
      'Biometric credentials are currently only available on iOS and Android.',
    );
  });
});

describe('reverify', () => {
  beforeEach(() => {
    signInClerkUser();
  });

  test('verifies the first factor with the biometric credential and refreshes the session token', async () => {
    addLocalCredential();

    const result = await renderBiometricCredentials().reverify({ reason: 'Confirm with Face ID.' });

    expect(clerk.session.startVerification).toHaveBeenCalledWith({ level: 'first_factor' });
    expect(clerk.session.prepareFirstFactorVerification).toHaveBeenCalledWith({
      strategy: 'trusted_device',
      trustedDeviceId: 'td_1',
    });
    expect(biometrics.sign).toHaveBeenCalledWith('key_1', 'reverification-client-data', 'Confirm with Face ID.');
    expect(clerk.session.attemptFirstFactorVerification).toHaveBeenCalledWith({
      strategy: 'trusted_device',
      trustedDeviceId: 'td_1',
      clientData: 'reverification-client-data',
      signature: 'signature',
      algorithm: 'ES256',
    });
    expect(clerk.session.clearCache).toHaveBeenCalled();
    expect(clerk.session.getToken).toHaveBeenCalledWith({ skipCache: true });
    expect(result).toEqual({ id: 'sessver_1', status: 'complete', level: 'multi_factor', session: clerk.session });
    expect(clerk.session.prepareSecondFactorVerification).not.toHaveBeenCalled();
    expect(mocks.idle).not.toHaveBeenCalled();
    expect(mocks.pullFromNative).not.toHaveBeenCalled();
  });

  test('continues with the second factor when the first factor leaves one outstanding', async () => {
    addLocalCredential();
    clerk.session.attemptFirstFactorVerification.mockResolvedValueOnce(sessionVerification('needs_second_factor'));

    const result = await renderBiometricCredentials().reverify({ level: 'multi_factor' });

    expect(clerk.session.startVerification).toHaveBeenCalledWith({ level: 'multi_factor' });
    expect(clerk.session.prepareSecondFactorVerification).toHaveBeenCalledWith({
      strategy: 'trusted_device',
      trustedDeviceId: 'td_1',
    });
    expect(clerk.session.attemptSecondFactorVerification).toHaveBeenCalledWith(
      expect.objectContaining({ strategy: 'trusted_device', trustedDeviceId: 'td_1', signature: 'signature' }),
    );
    expect(biometrics.sign).toHaveBeenCalledTimes(2);
    expect(result.status).toBe('complete');
  });

  test('verifies only the second factor when the verification starts there', async () => {
    addLocalCredential();
    clerk.session.startVerification.mockResolvedValueOnce(sessionVerification('needs_second_factor'));

    await renderBiometricCredentials().reverify({ level: 'second_factor' });

    expect(clerk.session.prepareFirstFactorVerification).not.toHaveBeenCalled();
    expect(clerk.session.prepareSecondFactorVerification).toHaveBeenCalled();
    expect(biometrics.sign).toHaveBeenCalledWith(
      'key_1',
      'reverification-client-data',
      'Use biometrics to verify your identity.',
    );
  });

  test('does not prompt when the verification is already complete', async () => {
    addLocalCredential();
    clerk.session.startVerification.mockResolvedValueOnce(sessionVerification('complete'));

    const result = await renderBiometricCredentials().reverify();

    expect(biometrics.sign).not.toHaveBeenCalled();
    expect(clerk.session.getToken).toHaveBeenCalledWith({ skipCache: true });
    expect(result.status).toBe('complete');
  });

  test('returns an incomplete verification without refreshing the session token', async () => {
    addLocalCredential();
    clerk.session.attemptFirstFactorVerification.mockResolvedValueOnce(sessionVerification('needs_first_factor'));

    const result = await renderBiometricCredentials().reverify();

    expect(result.status).toBe('needs_first_factor');
    expect(clerk.session.clearCache).not.toHaveBeenCalled();
    expect(clerk.session.getToken).not.toHaveBeenCalled();
  });

  test('rejects an invalid level before starting the verification', async () => {
    addLocalCredential();

    await expect(
      renderBiometricCredentials().reverify({ level: 'everything' as 'first_factor' }),
    ).rejects.toMatchObject({ code: 'invalid_reverification_level' });
    expect(clerk.session.startVerification).not.toHaveBeenCalled();
  });

  test('requires a session with a user', async () => {
    clerk.instance.session = null;

    await expect(renderBiometricCredentials().reverify()).rejects.toMatchObject({
      code: 'biometric_reverification_session_unavailable',
    });
  });

  test('requires a local credential for the session user', async () => {
    addLocalCredential({ userId: 'user_2' });

    await expect(renderBiometricCredentials().reverify()).rejects.toMatchObject({
      code: 'E_BIOMETRIC_REVERIFICATION_FAILED',
      message: 'Biometric reverification is unavailable: no_local_credential.',
    });
    expect(clerk.session.startVerification).not.toHaveBeenCalled();
  });

  test('requires a credential bound to the current biometric set', async () => {
    addLocalCredential({ policy: 'biometry_any' });

    await expect(renderBiometricCredentials().reverify()).rejects.toMatchObject({
      code: 'biometric_credential_policy_incompatible',
    });
    expect(clerk.session.startVerification).not.toHaveBeenCalled();
  });

  test('rejects a challenge issued for another credential without prompting', async () => {
    addLocalCredential();
    clerk.session.prepareFirstFactorVerification.mockResolvedValueOnce(
      sessionVerification('needs_first_factor', {
        firstFactorVerification: trustedDeviceVerification({ trustedDeviceId: 'td_other' }),
      }),
    );

    await expect(renderBiometricCredentials().reverify()).rejects.toThrow(
      'Biometric reverification did not return a matching challenge.',
    );
    expect(biometrics.sign).not.toHaveBeenCalled();
  });

  test('rejects an expired challenge without prompting', async () => {
    addLocalCredential();
    clerk.session.prepareFirstFactorVerification.mockResolvedValueOnce(
      sessionVerification('needs_first_factor', {
        firstFactorVerification: trustedDeviceVerification({ expiresAt: new Date(Date.now() - 1_000) }),
      }),
    );

    await expect(renderBiometricCredentials().reverify()).rejects.toThrow(
      'Biometric reverification challenge has expired.',
    );
    expect(biometrics.sign).not.toHaveBeenCalled();
  });

  test('forgets the local credential when its key was invalidated', async () => {
    addLocalCredential();
    biometrics.sign.mockRejectedValueOnce(moduleError('key_invalidated'));

    await expect(renderBiometricCredentials().reverify()).rejects.toMatchObject({ code: 'key_invalidated' });
    expect(biometrics.store.records).toEqual([]);
  });

  test('forgets the local credential when the server no longer has it', async () => {
    addLocalCredential();
    const cause = apiError('trusted_device_not_registered', 'trusted_device_id');
    clerk.session.prepareFirstFactorVerification.mockRejectedValueOnce(cause);

    await expectBiometricApiError(renderBiometricCredentials().reverify(), cause);
    expect(biometrics.store.records).toEqual([]);
  });

  test('fails when the session token cannot be refreshed', async () => {
    addLocalCredential();
    clerk.session.getToken.mockResolvedValueOnce(null);

    await expect(renderBiometricCredentials().reverify()).rejects.toThrow(
      'Unable to refresh the session token after biometric reverification.',
    );
  });

  test('rejects reverification on unsupported platforms', async () => {
    await expect(renderBiometricCredentials(useBiometricCredentialsOnUnsupportedPlatform).reverify()).rejects.toThrow(
      'only available on iOS and Android',
    );
  });
});
