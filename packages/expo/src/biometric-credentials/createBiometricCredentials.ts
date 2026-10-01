import type { useClerk } from '@clerk/react';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import type {
  BiometricCredentialResource,
  EnvironmentResource,
  PrepareBiometricCredentialParams,
  SessionResource,
  SessionVerificationLevel,
  SessionVerificationResource,
  SignInResource,
  UserResource,
} from '@clerk/shared/types';
import { Platform } from 'react-native';

import { errorThrower } from '../utils/errors';
import type { BiometricCredentialError, BiometricCredentialErrorCode } from './errors';
import type { ExpoBiometricsModule, ExpoBiometricsRecord } from './loadExpoBiometrics';
import { loadExpoBiometrics } from './loadExpoBiometrics';
import type {
  BiometricCredential,
  BiometricCredentialPlatform,
  BiometricCredentialPolicy,
  BiometricCredentialStatus,
  BiometricCredentialUnavailableReason,
  UseBiometricCredentialsReturn,
} from './types';

type Clerk = ReturnType<typeof useClerk>;

type OperationErrorCode =
  | 'E_TRUSTED_DEVICE_AVAILABILITY_FAILED'
  | 'E_TRUSTED_DEVICE_LIST_FAILED'
  | 'E_TRUSTED_DEVICE_ENROLLMENT_FAILED'
  | 'E_TRUSTED_DEVICE_REVOCATION_FAILED'
  | 'E_TRUSTED_DEVICE_SIGN_IN_FAILED'
  | 'E_BIOMETRIC_REVERIFICATION_FAILED';

type Biometrics = {
  module: ExpoBiometricsModule;
  appIdentifier: string;
  fallbackCode: OperationErrorCode;
};

type LocalCredentialSelection =
  | { record: ExpoBiometricsRecord; unavailableReason?: never }
  | { record?: never; unavailableReason: BiometricCredentialUnavailableReason };

const DEFAULT_POLICY: BiometricCredentialPolicy = 'biometry_current_set';
const POLICIES: ReadonlySet<string> = new Set<BiometricCredentialPolicy>([
  'biometry_current_set',
  'biometry_any',
  'biometry_or_device_passcode',
]);
const DEFAULT_ENROLLMENT_REASON = 'Use biometrics to enroll this device.';
const DEFAULT_SIGN_IN_REASON = 'Use biometrics to sign in.';
const DEFAULT_REVERIFICATION_REASON = 'Use biometrics to verify your identity.';
const REVERIFICATION_LEVELS = new Set<SessionVerificationLevel>(['first_factor', 'second_factor', 'multi_factor']);

const EXPO_BIOMETRICS_INSTALL_INSTRUCTIONS =
  'Install it with `npx expo install @clerk/expo-biometrics`, then rebuild your development build.';

const MISSING_CREDENTIAL_ERROR_CODES = new Set(['form_resource_not_found', 'trusted_device_not_registered']);
const TRUSTED_DEVICE_ID_PARAM = 'trusted_device_id';

const MODULE_ERROR_CODES: Record<string, BiometricCredentialErrorCode | undefined> = {
  user_canceled: 'biometric_authentication_canceled',
  system_canceled: 'biometric_authentication_canceled',
  user_fallback: 'biometric_authentication_canceled',
  authentication_failed: 'biometric_authentication_failed',
  biometry_not_available: 'biometric_authentication_unavailable',
  biometry_not_enrolled: 'biometric_authentication_unavailable',
  biometry_lockout: 'biometric_authentication_unavailable',
  passcode_not_set: 'biometric_authentication_unavailable',
  secure_key_storage_unavailable: 'biometric_authentication_unavailable',
  key_not_found: 'key_not_found',
  key_invalidated: 'key_invalidated',
  key_generation_failed: 'key_generation_failed',
  signing_failed: 'signing_failed',
};

function biometricCredentialError(
  code: BiometricCredentialErrorCode,
  message: string,
  cause?: unknown,
): BiometricCredentialError {
  return Object.assign(new Error(message), { code }, cause === undefined ? {} : { cause });
}

function moduleErrorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : undefined;
}

function toBiometricCredentialError(error: unknown, fallbackCode: OperationErrorCode): BiometricCredentialError {
  const code = moduleErrorCode(error);
  const message = error instanceof Error ? error.message : String(error);
  return biometricCredentialError((code && MODULE_ERROR_CODES[code]) || fallbackCode, message, error);
}

async function callModule<T>(biometrics: Biometrics, operation: (module: ExpoBiometricsModule) => T | Promise<T>) {
  try {
    return await operation(biometrics.module);
  } catch (error) {
    throw toBiometricCredentialError(error, biometrics.fallbackCode);
  }
}

function requireBiometrics(fallbackCode: OperationErrorCode): Biometrics {
  const module = loadExpoBiometrics();
  if (!module) {
    return errorThrower.throw(
      `Biometric credentials require the @clerk/expo-biometrics package. ${EXPO_BIOMETRICS_INSTALL_INSTRUCTIONS}`,
    );
  }
  try {
    return { module, appIdentifier: module.getAppIdentifier(), fallbackCode };
  } catch (error) {
    if (moduleErrorCode(error) === 'native_module_unavailable') {
      return errorThrower.throw(
        `Biometric credentials require a development build that includes @clerk/expo-biometrics, and are not available in Expo Go. ${EXPO_BIOMETRICS_INSTALL_INSTRUCTIONS}`,
      );
    }
    throw toBiometricCredentialError(error, fallbackCode);
  }
}

function normalizeIdentifierHint(identifierHint: string | null | undefined): string | null {
  const normalized = identifierHint?.trim().toLowerCase();
  return normalized ? normalized : null;
}

async function identifierHintMatcher(
  biometrics: Biometrics,
  identifierHint: string | undefined,
): Promise<(record: ExpoBiometricsRecord) => boolean> {
  const normalizedHint = normalizeIdentifierHint(identifierHint);
  if (!normalizedHint) {
    return () => true;
  }
  const hash = await callModule(biometrics, module => module.hashIdentifierHint(normalizedHint));
  return record => record.identifierHintSha256 === hash;
}

function newestFirst(a: ExpoBiometricsRecord, b: ExpoBiometricsRecord): number {
  if (a.createdAt !== b.createdAt) {
    return b.createdAt - a.createdAt;
  }
  if (a.updatedAt !== b.updatedAt) {
    return b.updatedAt - a.updatedAt;
  }
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

function toBiometricCredentialPlatform(platform: string): BiometricCredentialPlatform {
  return platform === 'ios' || platform === 'android' ? platform : 'unknown';
}

function toBiometricCredentialStatus(status: string): BiometricCredentialStatus {
  return status === 'active' || status === 'revoked' ? status : 'unknown';
}

function toBiometricCredential(credential: BiometricCredentialResource): BiometricCredential {
  return {
    id: credential.id,
    object: 'trusted_device',
    platform: toBiometricCredentialPlatform(credential.platform),
    appIdentifier: credential.appIdentifier,
    name: credential.name ?? null,
    algorithm: credential.algorithm,
    status: toBiometricCredentialStatus(credential.status),
    createdAt: credential.createdAt,
    updatedAt: credential.updatedAt,
    lastUsedAt: credential.lastUsedAt ?? null,
    revokedAt: credential.revokedAt ?? null,
  };
}

function toApiBiometricCredentialError(error: unknown, fallbackCode: OperationErrorCode): unknown {
  if (isClerkAPIResponseError(error)) {
    const apiError = error.errors[0];
    return biometricCredentialError(
      apiError?.code ?? fallbackCode,
      apiError?.longMessage ?? apiError?.message ?? error.message,
      error,
    );
  }
  if (error instanceof Error && typeof (error as { code?: unknown }).code === 'string') {
    return error;
  }
  return biometricCredentialError(fallbackCode, error instanceof Error ? error.message : String(error), error);
}

async function callApi<T>(fallbackCode: OperationErrorCode, request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw toApiBiometricCredentialError(error, fallbackCode);
  }
}

function isMissingCredentialError(error: unknown): boolean {
  return (
    isClerkAPIResponseError(error) &&
    error.errors.some(
      apiError =>
        MISSING_CREDENTIAL_ERROR_CODES.has(apiError.code) && apiError.meta?.paramName === TRUSTED_DEVICE_ID_PARAM,
    )
  );
}

export function createBiometricCredentials(clerk: Clerk): UseBiometricCredentialsReturn {
  function featureUnavailableReason(): BiometricCredentialUnavailableReason | null {
    const environment = (clerk as { __internal_environment?: EnvironmentResource | null }).__internal_environment;
    const nativeSettings = environment?.authConfig?.nativeSettings;
    if (!nativeSettings) {
      return 'environment_unavailable';
    }
    if (!nativeSettings.apiEnabled) {
      return 'native_api_disabled';
    }
    if (!nativeSettings.trustedDeviceSignInEnabled) {
      return 'feature_disabled';
    }
    return null;
  }

  function requireUser(fallbackCode: OperationErrorCode): UserResource {
    const user = clerk.user;
    if (!user) {
      throw biometricCredentialError(fallbackCode, 'Biometric credential management requires a signed-in user.');
    }
    return user;
  }

  async function deleteLocalCredential(biometrics: Biometrics, record: ExpoBiometricsRecord): Promise<void> {
    await callModule(biometrics, module => module.deleteRecord(record.localKeyId));
  }

  async function ignoreErrors(operation: () => Promise<unknown>): Promise<void> {
    try {
      await operation();
    } catch {
      // Cleanup must not mask the error that triggered it.
    }
  }

  async function forgetLocalCredentialIfMissing(
    biometrics: Biometrics,
    record: ExpoBiometricsRecord,
    error: unknown,
  ): Promise<unknown> {
    if (isMissingCredentialError(error)) {
      await ignoreErrors(() => deleteLocalCredential(biometrics, record));
    }
    return toApiBiometricCredentialError(error, biometrics.fallbackCode);
  }

  async function signChallenge(
    biometrics: Biometrics,
    record: ExpoBiometricsRecord,
    clientData: string,
    reason: string,
  ): Promise<string> {
    try {
      return await biometrics.module.sign(record.localKeyId, clientData, reason);
    } catch (error) {
      const biometricError = toBiometricCredentialError(error, biometrics.fallbackCode);
      if (biometricError.code === 'key_invalidated' || biometricError.code === 'key_not_found') {
        await ignoreErrors(() => deleteLocalCredential(biometrics, record));
      }
      throw biometricError;
    }
  }

  async function localCredentialCandidates(
    biometrics: Biometrics,
    id: string | undefined,
    identifierHint: string | undefined,
  ): Promise<ExpoBiometricsRecord[] | BiometricCredentialUnavailableReason> {
    const unavailableReason = featureUnavailableReason();
    if (unavailableReason) {
      return unavailableReason;
    }

    const device = await callModule(biometrics, module => module.getAvailability());
    if (!device.secureKeyStorageAvailable) {
      return 'biometric_authentication_unavailable';
    }

    const matchesIdentifierHint = await identifierHintMatcher(biometrics, identifierHint);
    const records = (await callModule(biometrics, module => module.listRecords()))
      .filter(
        record =>
          record.appIdentifier === biometrics.appIdentifier &&
          (id === undefined || record.id === id) &&
          matchesIdentifierHint(record),
      )
      .sort(newestFirst);
    if (records.length === 0) {
      return 'no_local_credential';
    }

    const recordsWithKeys: ExpoBiometricsRecord[] = [];
    for (const record of records) {
      if (await callModule(biometrics, module => module.hasKey(record.localKeyId))) {
        recordsWithKeys.push(record);
      } else {
        await deleteLocalCredential(biometrics, record);
      }
    }
    if (recordsWithKeys.length === 0) {
      return 'local_key_missing';
    }

    const supportedRecords = recordsWithKeys.filter(record =>
      record.policy === 'biometry_or_device_passcode' ? device.canEvaluateDeviceOwner : device.canEvaluateBiometrics,
    );
    if (supportedRecords.length === 0) {
      return 'biometric_authentication_unavailable';
    }
    return supportedRecords;
  }

  async function selectLocalCredential(
    biometrics: Biometrics,
    id: string | undefined,
    identifierHint: string | undefined,
  ): Promise<LocalCredentialSelection> {
    const candidates = await localCredentialCandidates(biometrics, id, identifierHint);
    if (typeof candidates === 'string') {
      return { unavailableReason: candidates };
    }

    const session = clerk.session;
    const activeUser = session?.status === 'active' ? session.user : null;
    if (!activeUser?.id) {
      return { record: candidates[0] };
    }

    const activeUserRecords = candidates.filter(record => record.userId === activeUser.id);
    if (activeUserRecords.length === 0) {
      return { unavailableReason: 'no_local_credential' };
    }

    const serverCredentials = await callApi(biometrics.fallbackCode, () =>
      activeUser.__experimental_getBiometricCredentials(),
    );
    let firstUnavailableReason: BiometricCredentialUnavailableReason | null = null;
    for (const record of activeUserRecords) {
      const serverCredential = serverCredentials.find(credential => credential.id === record.id);
      if (!serverCredential) {
        await deleteLocalCredential(biometrics, record);
        firstUnavailableReason ??= 'server_credential_missing';
        continue;
      }
      if (serverCredential.status !== 'active') {
        await deleteLocalCredential(biometrics, record);
        firstUnavailableReason ??= 'server_credential_revoked';
        continue;
      }
      return { record };
    }
    return { unavailableReason: firstUnavailableReason ?? 'server_credential_missing' };
  }

  async function reverificationCredential(biometrics: Biometrics, userId: string): Promise<ExpoBiometricsRecord> {
    const candidates = await localCredentialCandidates(biometrics, undefined, undefined);
    if (typeof candidates === 'string') {
      throw biometricCredentialError(
        biometrics.fallbackCode,
        `Biometric reverification is unavailable: ${candidates}.`,
      );
    }
    const userRecords = candidates.filter(record => record.userId === userId);
    if (userRecords.length === 0) {
      throw biometricCredentialError(
        biometrics.fallbackCode,
        'Biometric reverification is unavailable: no_local_credential.',
      );
    }
    const record = userRecords.find(candidate => candidate.policy === 'biometry_current_set');
    if (!record) {
      throw biometricCredentialError(
        'biometric_credential_policy_incompatible',
        'This biometric credential cannot be used for reverification. Verify your identity using another method.',
      );
    }
    return record;
  }

  async function verifySessionFactor(
    biometrics: Biometrics,
    session: SessionResource,
    record: ExpoBiometricsRecord,
    factor: 'first' | 'second',
    reason: string,
  ): Promise<SessionVerificationResource> {
    let prepared: SessionVerificationResource;
    try {
      const config = { strategy: 'trusted_device', trustedDeviceId: record.id } as const;
      prepared =
        factor === 'first'
          ? await session.prepareFirstFactorVerification(config)
          : await session.prepareSecondFactorVerification(config);
    } catch (error) {
      throw await forgetLocalCredentialIfMissing(biometrics, record, error);
    }

    const verification = factor === 'first' ? prepared.firstFactorVerification : prepared.secondFactorVerification;
    const challenge = verification?.strategy === 'trusted_device' ? verification.trustedDeviceChallenge : null;
    if (!challenge || (challenge.trustedDeviceId && challenge.trustedDeviceId !== record.id)) {
      throw biometricCredentialError(
        biometrics.fallbackCode,
        'Biometric reverification did not return a matching challenge.',
      );
    }
    if (challenge.expiresAt && challenge.expiresAt.getTime() <= Date.now()) {
      throw biometricCredentialError(biometrics.fallbackCode, 'Biometric reverification challenge has expired.');
    }

    const signature = await signChallenge(biometrics, record, challenge.clientData, reason);

    try {
      const attempt = {
        strategy: 'trusted_device',
        trustedDeviceId: record.id,
        clientData: challenge.clientData,
        signature,
        algorithm: 'ES256',
      } as const;
      return factor === 'first'
        ? await session.attemptFirstFactorVerification(attempt)
        : await session.attemptSecondFactorVerification(attempt);
    } catch (error) {
      throw await forgetLocalCredentialIfMissing(biometrics, record, error);
    }
  }

  return {
    getAvailability: async params => {
      const biometrics = requireBiometrics('E_TRUSTED_DEVICE_AVAILABILITY_FAILED');
      const selection = await selectLocalCredential(biometrics, params?.id, params?.identifierHint);
      return selection.record
        ? { isAvailable: true, unavailableReason: null }
        : { isAvailable: false, unavailableReason: selection.unavailableReason };
    },

    list: async () => {
      const biometrics = requireBiometrics('E_TRUSTED_DEVICE_LIST_FAILED');
      const user = requireUser(biometrics.fallbackCode);
      const credentials = await callApi(biometrics.fallbackCode, () => user.__experimental_getBiometricCredentials());
      return credentials.map(toBiometricCredential);
    },

    enroll: async params => {
      const biometrics = requireBiometrics('E_TRUSTED_DEVICE_ENROLLMENT_FAILED');
      const session = clerk.session;
      if (!session || (session.status !== 'active' && session.status !== 'pending') || !session.user) {
        throw biometricCredentialError(
          biometrics.fallbackCode,
          'Unable to enroll a biometric credential without an active or pending Clerk session.',
        );
      }
      const user = session.user;
      const unavailableReason = featureUnavailableReason();
      if (unavailableReason) {
        throw biometricCredentialError(
          unavailableReason === 'environment_unavailable' ? unavailableReason : biometrics.fallbackCode,
          `Unable to enroll a biometric credential: ${unavailableReason}.`,
        );
      }

      const policy = params?.policy ?? DEFAULT_POLICY;
      if (!POLICIES.has(policy)) {
        throw biometricCredentialError(
          'invalid_trusted_device_policy',
          `Invalid biometric-credential policy: ${policy}.`,
        );
      }
      const key = await callModule(biometrics, module => module.createKey(policy));
      const enrollment: PrepareBiometricCredentialParams = {
        platform: Platform.OS === 'android' ? 'android' : 'ios',
        appIdentifier: biometrics.appIdentifier,
        algorithm: 'ES256',
        publicKeyJwk: key.publicKeyJwk,
        ...(params?.name === undefined ? {} : { name: params.name }),
      };

      let credential: BiometricCredentialResource;
      try {
        const challenge = await callApi(biometrics.fallbackCode, () =>
          user.__experimental_prepareBiometricCredential(enrollment),
        );
        const signature = await callModule(biometrics, module =>
          module.sign(key.localKeyId, challenge.clientData, params?.reason ?? DEFAULT_ENROLLMENT_REASON),
        );
        credential = await callApi(biometrics.fallbackCode, () =>
          user.__experimental_attemptBiometricCredential({
            ...enrollment,
            clientData: challenge.clientData,
            signature,
          }),
        );
      } catch (error) {
        await ignoreErrors(() => biometrics.module.deleteKey(key.localKeyId));
        throw error;
      }

      const identifierHint = normalizeIdentifierHint(params?.identifierHint);
      try {
        await callModule(biometrics, module =>
          module.saveRecord(
            {
              id: credential.id,
              localKeyId: key.localKeyId,
              userId: user.id,
              appIdentifier: biometrics.appIdentifier,
              ...(identifierHint ? { identifierHint } : {}),
              policy,
              createdAt: credential.createdAt.getTime(),
              updatedAt: credential.updatedAt.getTime(),
            },
            { removeOtherRecordsForApp: true },
          ),
        );
      } catch (error) {
        await ignoreErrors(() => user.__experimental_revokeBiometricCredential(credential.id));
        await ignoreErrors(() => biometrics.module.deleteKey(key.localKeyId));
        throw error;
      }
      return toBiometricCredential(credential);
    },

    revoke: async id => {
      const biometrics = requireBiometrics('E_TRUSTED_DEVICE_REVOCATION_FAILED');
      const user = requireUser(biometrics.fallbackCode);
      const credential = await callApi(biometrics.fallbackCode, () =>
        user.__experimental_revokeBiometricCredential(id),
      );
      await ignoreErrors(async () => {
        const records = await biometrics.module.listRecords();
        const localKeyIds = new Set(records.filter(record => record.id === id).map(record => record.localKeyId));
        for (const localKeyId of localKeyIds) {
          await biometrics.module.deleteRecord(localKeyId);
        }
      });
      return toBiometricCredential(credential);
    },

    signIn: async params => {
      const biometrics = requireBiometrics('E_TRUSTED_DEVICE_SIGN_IN_FAILED');
      const clientSignIn = clerk.client?.signIn;
      if (!clientSignIn) {
        throw biometricCredentialError(
          biometrics.fallbackCode,
          'Biometric sign-in requires a loaded Clerk client: the client sign-in resource is unavailable.',
        );
      }

      const selection = await selectLocalCredential(biometrics, params?.id, params?.identifierHint);
      if (!selection.record) {
        throw biometricCredentialError(
          biometrics.fallbackCode,
          `Biometric sign-in is unavailable: ${selection.unavailableReason}.`,
        );
      }
      const record = selection.record;

      let signIn: SignInResource;
      try {
        signIn = await clientSignIn.create({ strategy: 'trusted_device', trustedDeviceId: record.id });
      } catch (error) {
        throw await forgetLocalCredentialIfMissing(biometrics, record, error);
      }

      const challenge = signIn.firstFactorVerification?.trustedDeviceChallenge;
      if (!challenge) {
        throw biometricCredentialError(biometrics.fallbackCode, 'Biometric sign-in did not return a challenge.');
      }

      const signature = await signChallenge(
        biometrics,
        record,
        challenge.clientData,
        params?.reason ?? DEFAULT_SIGN_IN_REASON,
      );

      try {
        signIn = await signIn.attemptFirstFactor({
          strategy: 'trusted_device',
          trustedDeviceId: record.id,
          clientData: challenge.clientData,
          signature,
          algorithm: 'ES256',
        });
      } catch (error) {
        throw await forgetLocalCredentialIfMissing(biometrics, record, error);
      }

      if (!signIn.status) {
        throw biometricCredentialError(biometrics.fallbackCode, 'Biometric sign-in did not return a status.');
      }
      return {
        status: signIn.status,
        createdSessionId: signIn.createdSessionId,
        signIn,
        setActive: clerk.setActive,
      };
    },

    reverify: async params => {
      const biometrics = requireBiometrics('E_BIOMETRIC_REVERIFICATION_FAILED');
      const level = params?.level ?? 'first_factor';
      if (!REVERIFICATION_LEVELS.has(level)) {
        throw biometricCredentialError(
          'invalid_reverification_level',
          'Biometric reverification level must be first_factor, second_factor, or multi_factor.',
        );
      }
      const session = clerk.session;
      if (!session || (session.status !== 'active' && session.status !== 'pending') || !session.user) {
        throw biometricCredentialError(
          'biometric_reverification_session_unavailable',
          'Biometric reverification requires an active or pending session with a user.',
        );
      }
      const record = await reverificationCredential(biometrics, session.user.id);
      const reason = params?.reason ?? DEFAULT_REVERIFICATION_REASON;

      let verification = await callApi(biometrics.fallbackCode, () => session.startVerification({ level }));
      if (verification.status === 'needs_first_factor') {
        verification = await verifySessionFactor(biometrics, session, record, 'first', reason);
        if (verification.status === 'needs_second_factor') {
          verification = await verifySessionFactor(biometrics, session, record, 'second', reason);
        }
      } else if (verification.status === 'needs_second_factor') {
        verification = await verifySessionFactor(biometrics, session, record, 'second', reason);
      } else if (verification.status !== 'complete') {
        throw biometricCredentialError(
          biometrics.fallbackCode,
          'The server returned an unsupported reverification status.',
        );
      }

      if (verification.status === 'complete') {
        session.clearCache();
        const token = await callApi(biometrics.fallbackCode, () => session.getToken({ skipCache: true }));
        if (!token) {
          throw biometricCredentialError(
            biometrics.fallbackCode,
            'Unable to refresh the session token after biometric reverification.',
          );
        }
      }
      return { id: verification.id ?? null, status: verification.status, level: verification.level, session };
    },
  };
}
