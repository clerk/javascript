import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import type {
  BiometricCredential,
  BiometricCredentialAvailability,
  BiometricCredentialChallengeJSON,
  BiometricCredentialEnrollmentParams,
  BiometricCredentialPolicy,
  BiometricCredentialSelectionParams,
  BiometricCredentialsResource,
  BiometricCredentialUnavailableReason,
  BiometricCredentialValidationResult,
  SignInFutureBiometricCredentialParams,
} from '@clerk/shared/types';

import type { Clerk } from '../core/clerk';
import { BaseResource } from '../core/resources/internal';

type LocalKey = { localKeyId: string; publicKeyJwk: string };
type Signature = { clientData: string; signature: string; algorithm: string };
type LocalRecord = {
  id: string;
  localKeyId: string;
  userId: string;
  appIdentifier: string;
  identifierHint: string | null;
  policy: BiometricCredentialPolicy;
  createdAt: number;
  updatedAt: number;
};
type Storage = { read(): Promise<string | null>; write(value: string): Promise<void> };
export type NativeBiometricHost = {
  platform: 'ios' | 'android';
  appIdentifier(): Promise<string>;
  storage: Storage;
  cleanupStorage: Storage;
  installation?: { isCurrent(): Promise<boolean>; markCurrent(): Promise<void> };
  supports(policy: BiometricCredentialPolicy): Promise<boolean>;
  hasKey(localKeyId: string): Promise<boolean>;
  createKey(policy: BiometricCredentialPolicy): Promise<LocalKey>;
  sign(params: {
    localKeyId: string;
    policy: BiometricCredentialPolicy;
    clientData: string;
    reason: string;
    promptSubtitle?: string;
  }): Promise<Signature>;
  deleteKey(localKeyId: string): Promise<void>;
};
type CredentialJSON = {
  id: string;
  object: string;
  platform: string;
  app_identifier: string;
  name: string | null;
  algorithm: string;
  status: string;
  created_at: number;
  updated_at: number;
  last_used_at: number | null;
  revoked_at: number | null;
};
type Candidates = { records: LocalRecord[]; reason: BiometricCredentialUnavailableReason | null };
const policies: BiometricCredentialPolicy[] = ['biometry_current_set', 'biometry_any', 'biometry_or_device_passcode'];
const normalizeHint = (value?: string | null) => value?.trim().toLowerCase() || null;
const unavailable = (reason: BiometricCredentialUnavailableReason): BiometricCredentialAvailability => ({
  isAvailable: false,
  unavailableReason: reason,
});
const available: BiometricCredentialAvailability = { isAvailable: true, unavailableReason: null };
const fail = (code: string) => new ClerkRuntimeError('Biometric authentication could not be completed.', { code });
const isMissingCredential = (error: unknown) =>
  isClerkAPIResponseError(error) &&
  error.errors.some(
    ({ code, meta }) =>
      ['form_resource_not_found', 'trusted_device_not_registered'].includes(code) &&
      meta?.paramName === 'trusted_device_id',
  );
const isMissingKey = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  ['key_not_found', 'key_invalidated'].includes(String(error.code));

/** Owns credential selection, server reconciliation, and enrollment policy; keys stay in the host. */
export class NativeBiometricCredentials implements BiometricCredentialsResource {
  #generation = 0;
  #writes: Promise<unknown> = Promise.resolve();
  #installationReady = false;
  #installationPromise?: Promise<void>;
  constructor(
    private readonly clerk: Clerk,
    private readonly host?: NativeBiometricHost,
  ) {}

  get canEnroll(): boolean {
    return (
      !!this.clerk.session?.user?.id &&
      ['active', 'pending'].includes(this.clerk.session?.status ?? '') &&
      !this.featureReason()
    );
  }

  invalidate(): void {
    ++this.#generation;
  }

  async list(): Promise<BiometricCredential[]> {
    const response = await this.request<CredentialJSON[]>(
      '/me/biometric_credentials',
      'GET',
      undefined,
      this.clerk.session?.id,
    );
    if (!Array.isArray(response)) {
      throw fail('invalid_biometric_response');
    }
    return response.map(value => this.credential(value));
  }

  async localAvailability(params: BiometricCredentialSelectionParams = {}): Promise<BiometricCredentialAvailability> {
    const result = await this.candidates(params);
    return result.reason ? unavailable(result.reason) : available;
  }

  async availability(params: BiometricCredentialSelectionParams = {}): Promise<BiometricCredentialAvailability> {
    const result = await this.selected(params);
    return result.reason ? unavailable(result.reason) : available;
  }

  async validateLocalCredential(
    params: BiometricCredentialSelectionParams = {},
  ): Promise<BiometricCredentialValidationResult> {
    if (this.featureReason() === 'environmentUnavailable') {
      return { status: 'inconclusive', reason: null };
    }
    try {
      const candidates = await this.candidates(params);
      if (candidates.reason) {
        return { status: 'invalid', reason: candidates.reason };
      }
      if (!this.clerk.client) {
        return { status: 'inconclusive', reason: null };
      }
      for (const record of candidates.records) {
        try {
          const response = await this.request<{ valid: boolean }>('/client/biometric_credentials/validate', 'POST', {
            trustedDeviceId: record.id,
          });
          if (response.valid) {
            return { status: 'valid', reason: null };
          }
          await this.deleteLocal(record);
        } catch (error) {
          if (isMissingCredential(error)) {
            await this.deleteLocal(record);
            continue;
          }
          if (isClerkAPIResponseError(error)) {
            if (error.errors.some(({ code }) => code === 'native_api_disabled')) {
              return { status: 'invalid', reason: 'nativeAPIDisabled' };
            }
            if (error.errors.some(({ code }) => code === 'feature_not_enabled')) {
              return { status: 'invalid', reason: 'featureDisabled' };
            }
          }
          return { status: 'inconclusive', reason: null };
        }
      }
      return { status: 'invalid', reason: 'serverCredentialMissing' };
    } catch {
      return { status: 'inconclusive', reason: null };
    }
  }

  async enroll(params: BiometricCredentialEnrollmentParams = {}): Promise<BiometricCredential> {
    await this.ensureInstallation();
    const session = this.clerk.session;
    if (!session || !['active', 'pending'].includes(session.status) || !session.user?.id) {
      throw fail('biometric_session_required');
    }
    const reason = this.featureReason();
    if (reason) {
      throw fail(reason);
    }
    const host = this.requireHost();
    const generation = this.#generation;
    const userId = session.user.id;
    const sessionId = session.id;
    const assertEnrollmentCurrent = () => {
      this.assertCurrent(generation);
      if (this.clerk.session?.id !== sessionId || this.clerk.session?.user?.id !== userId) {
        throw fail('stale_authentication_attempt');
      }
    };
    const appIdentifier = await host.appIdentifier();
    if (!appIdentifier) {
      throw fail('missing_app_identifier');
    }
    const policy =
      params.policy ?? (host.platform === 'android' ? 'biometry_or_device_passcode' : 'biometry_current_set');
    await this.records();
    assertEnrollmentCurrent();
    const key = await host.createKey(policy);
    let enrolled: BiometricCredential | undefined;
    let persisted: LocalRecord | undefined;
    let replaced: LocalRecord[] = [];
    try {
      assertEnrollmentCurrent();
      const body = {
        platform: host.platform,
        appIdentifier,
        name: params.name,
        algorithm: 'ES256',
        publicKeyJwk: key.publicKeyJwk,
      };
      const challenge = await this.request<BiometricCredentialChallengeJSON>(
        '/me/biometric_credentials/prepare',
        'POST',
        body,
        sessionId,
      );
      assertEnrollmentCurrent();
      this.validateChallenge(challenge);
      const signature = await host.sign({
        localKeyId: key.localKeyId,
        policy,
        clientData: challenge.client_data,
        reason: params.reason ?? 'Use biometrics to enroll this device.',
        promptSubtitle: params.promptSubtitle,
      });
      assertEnrollmentCurrent();
      this.validateSignature(signature, challenge);
      const result = this.credential(
        await this.request<CredentialJSON>(
          '/me/biometric_credentials/attempt',
          'POST',
          { ...body, ...signature },
          sessionId,
        ),
      );
      enrolled = result;
      assertEnrollmentCurrent();
      if (result.appIdentifier !== appIdentifier || result.platform !== host.platform) {
        throw fail('invalid_biometric_response');
      }
      const record: LocalRecord = {
        id: result.id,
        localKeyId: key.localKeyId,
        userId,
        appIdentifier,
        identifierHint: normalizeHint(params.identifierHint),
        policy,
        createdAt: result.createdAt.getTime(),
        updatedAt: result.updatedAt.getTime(),
      };
      replaced = await this.serialized(async () => {
        assertEnrollmentCurrent();
        const records = await this.rawRecords();
        assertEnrollmentCurrent();
        const previous: LocalRecord[] = [];
        const retained = records.filter(value => {
          const existing = this.localRecord(value);
          if (existing?.id !== record.id || existing.appIdentifier !== appIdentifier) return true;
          previous.push(existing);
          return false;
        });
        await host.storage.write(JSON.stringify([...retained, record]));
        return previous;
      });
      persisted = record;
      assertEnrollmentCurrent();
      const remaining = await this.records().catch(() => []);
      for (const old of [...replaced, ...remaining]) {
        if (old.appIdentifier === appIdentifier && old.localKeyId !== record.localKeyId) {
          await this.deleteLocal(old).catch(() => undefined);
        }
      }
      return result;
    } catch (error) {
      if (enrolled) {
        await this.request(
          '/me/biometric_credentials/' + encodeURIComponent(enrolled.id),
          'DELETE',
          undefined,
          sessionId,
        ).catch(() => undefined);
      }
      if (persisted) {
        for (const record of [...replaced, persisted]) await this.deleteLocal(record).catch(() => undefined);
      } else {
        await host.deleteKey(key.localKeyId).catch(() => undefined);
      }
      throw error;
    }
  }

  async revoke({ id }: { id: string }): Promise<BiometricCredential> {
    const result = this.credential(
      await this.request<CredentialJSON>(
        '/me/biometric_credentials/' + encodeURIComponent(id),
        'DELETE',
        undefined,
        this.clerk.session?.id,
      ),
    );
    if (this.host) {
      try {
        const record = (await this.records()).find(record => record.id === id);
        if (record) await this.deleteLocal(record);
      } catch {
        // Local cleanup cannot undo a successful server revocation.
      }
    }
    return result;
  }

  async revokeCurrentDeviceCredential(): Promise<BiometricCredential | null> {
    if (!this.clerk.session || !['active', 'pending'].includes(this.clerk.session.status)) {
      throw fail('biometric_session_required');
    }
    const { records } = await this.selected({ currentUser: true });
    return records.length ? this.revoke({ id: records[0].id }) : null;
  }

  async forgetLocalCredentials({ userId }: { userId: string }): Promise<number> {
    await this.ensureInstallation();
    const host = this.requireHost();
    const appIdentifier = await host.appIdentifier();
    await this.updateCleanup(users => [...new Set([...users, userId])]);
    const records = (await this.records()).filter(
      record => record.userId === userId && record.appIdentifier === appIdentifier,
    );
    for (const record of records) {
      await this.deleteLocal(record);
    }
    await this.updateCleanup(users => users.filter(value => value !== userId));
    return records.length;
  }

  async retryPendingCleanup(): Promise<void> {
    if (!this.host) {
      return;
    }
    await this.ensureInstallation();
    for (const userId of await this.cleanupUsers()) {
      await this.forgetLocalCredentials({ userId }).catch(() => undefined);
    }
  }

  async authenticate(
    params: SignInFutureBiometricCredentialParams,
    prepare: (id: string) => Promise<BiometricCredentialChallengeJSON | null>,
    attempt: (id: string, signature: Signature) => Promise<void>,
  ): Promise<void> {
    const host = this.requireHost();
    const generation = this.#generation;
    const selection = await this.selected(params);
    this.assertCurrent(generation);
    const record = selection.records[0];
    if (!record) {
      throw fail(selection.reason ?? 'noLocalCredential');
    }
    try {
      const challenge = await prepare(record.id);
      this.assertCurrent(generation);
      this.validateChallenge(challenge, record.id);
      const signature = await host.sign({
        localKeyId: record.localKeyId,
        policy: record.policy,
        clientData: challenge.client_data,
        reason: params.reason ?? 'Use biometrics to sign in.',
        promptSubtitle: params.promptSubtitle,
      });
      this.assertCurrent(generation);
      this.validateSignature(signature, challenge);
      await attempt(record.id, signature);
      this.assertCurrent(generation);
    } catch (error) {
      if (isMissingCredential(error) || isMissingKey(error)) {
        await this.deleteLocal(record).catch(() => undefined);
      }
      throw error;
    }
  }

  private featureReason(): BiometricCredentialUnavailableReason | null {
    const settings = this.clerk.__internal_environment?.authConfig.nativeSettings;
    if (!settings) {
      return 'environmentUnavailable';
    }
    if (!settings.apiEnabled) {
      return 'nativeAPIDisabled';
    }
    if (!settings.trustedDeviceSignInEnabled) {
      return 'featureDisabled';
    }
    if (!this.host) {
      return 'unsupportedPlatform';
    }
    return null;
  }

  private async candidates(params: BiometricCredentialSelectionParams): Promise<Candidates> {
    const reason = this.featureReason();
    if (reason) {
      return { records: [], reason };
    }
    const host = this.requireHost();
    const appIdentifier = await host.appIdentifier();
    const userId = params.currentUser ? this.clerk.user?.id : undefined;
    if (params.currentUser && !userId) {
      return { records: [], reason: 'noLocalCredential' };
    }
    const hint = normalizeHint(params.identifierHint);
    const records = (await this.records())
      .filter(
        record =>
          record.appIdentifier === appIdentifier &&
          (!params.id || record.id === params.id) &&
          (userId ? record.userId === userId : !hint || record.identifierHint === hint),
      )
      .sort((a, b) => b.createdAt - a.createdAt || b.updatedAt - a.updatedAt || b.id.localeCompare(a.id));
    if (!records.length) {
      return { records: [], reason: 'noLocalCredential' };
    }
    const existing: LocalRecord[] = [];
    for (const record of records) {
      let exists: boolean;
      try {
        exists = await host.hasKey(record.localKeyId);
      } catch (error) {
        if (!isMissingKey(error)) {
          throw error;
        }
        exists = false;
      }
      if (exists) {
        existing.push(record);
      } else {
        await this.deleteLocal(record);
      }
    }
    if (!existing.length) {
      return { records: [], reason: 'localKeyMissing' };
    }
    const supported: LocalRecord[] = [];
    for (const record of existing) {
      if (await host.supports(record.policy)) {
        supported.push(record);
      }
    }
    return { records: supported, reason: supported.length ? null : 'biometricAuthenticationUnavailable' };
  }

  private async selected(params: BiometricCredentialSelectionParams): Promise<Candidates> {
    const result = await this.candidates(params);
    if (result.reason || this.clerk.session?.status !== 'active' || !this.clerk.session.user?.id) {
      return result;
    }
    const userId = this.clerk.session.user.id;
    const records = result.records.filter(record => record.userId === userId);
    if (!records.length) {
      return { records: [], reason: 'noLocalCredential' };
    }
    const remote = await this.list();
    let reason: BiometricCredentialUnavailableReason | null = null;
    for (const record of records) {
      const credential = remote.find(value => value.id === record.id);
      if (credential?.status === 'active') {
        return { records: [record], reason: null };
      }
      await this.deleteLocal(record);
      reason ??= credential ? 'serverCredentialRevoked' : 'serverCredentialMissing';
    }
    return { records: [], reason: reason ?? 'serverCredentialMissing' };
  }

  private async ensureInstallation(): Promise<void> {
    const host = this.host;
    if (!host?.installation || this.#installationReady) return;
    if (!this.#installationPromise) {
      const installation = host.installation;
      this.#installationPromise = this.serialized(async () => {
        if (!(await installation.isCurrent())) {
          const appIdentifier = await host.appIdentifier();
          if (!appIdentifier) throw fail('missing_app_identifier');
          const records = this.parseRecords(await host.storage.read());
          const belongsToApp = (record: unknown): record is Record<string, unknown> =>
            !!record &&
            typeof record === 'object' &&
            'appIdentifier' in record &&
            record.appIdentifier === appIdentifier;
          for (const record of records) {
            if (belongsToApp(record) && typeof record.localKeyId === 'string' && record.localKeyId)
              await host.deleteKey(record.localKeyId);
          }
          // Preserve other applications' records, including unknown/malformed fields.
          // If key deletion or persistence fails, leave the marker unset for retry.
          await host.storage.write(JSON.stringify(records.filter(record => !belongsToApp(record))));
        }
        await installation.markCurrent();
        this.#installationReady = true;
      }).finally(() => {
        this.#installationPromise = undefined;
      });
    }
    await this.#installationPromise;
  }

  private async records(): Promise<LocalRecord[]> {
    return (await this.rawRecords()).map(value => this.localRecord(value)).filter(value => value !== null);
  }

  private async rawRecords(): Promise<unknown[]> {
    await this.ensureInstallation();
    return this.parseRecords(await this.requireHost().storage.read());
  }

  private parseRecords(raw: string | null): unknown[] {
    if (!raw) {
      return [];
    }
    let values: unknown;
    try {
      values = JSON.parse(raw);
    } catch {
      throw fail('invalid_biometric_metadata');
    }
    if (!Array.isArray(values)) {
      throw fail('invalid_biometric_metadata');
    }
    return values;
  }

  private localRecord(value: unknown): LocalRecord | null {
    if (!value || typeof value !== 'object') return null;
    let record = value as Record<string, unknown>;
    // Decode old Android records for selection without rewriting unrelated raw entries.
    if (this.host?.platform === 'android' && !('localKeyId' in record) && 'local_key_id' in record) {
      record = {
        id: record.id,
        localKeyId: record.local_key_id,
        userId: record.user_id,
        appIdentifier: record.app_identifier,
        identifierHint: record.identifier_hint,
        policy: record.policy === undefined ? 'biometry_or_device_passcode' : record.policy,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      };
    }
    if (
      !['id', 'localKeyId', 'userId', 'appIdentifier'].every(key => typeof record[key] === 'string' && record[key]) ||
      !(record.identifierHint == null || typeof record.identifierHint === 'string') ||
      !policies.includes(record.policy as BiometricCredentialPolicy) ||
      !Number.isFinite(record.createdAt) ||
      !Number.isFinite(record.updatedAt)
    )
      return null;
    const decoded = record as LocalRecord;
    return { ...decoded, identifierHint: normalizeHint(decoded.identifierHint) };
  }

  private async deleteLocal(record: LocalRecord): Promise<void> {
    const host = this.requireHost();
    await host.deleteKey(record.localKeyId);
    await this.serialized(async () => {
      const records = await this.rawRecords();
      await host.storage.write(
        JSON.stringify(
          records.filter(value => {
            const existing = this.localRecord(value);
            return (
              existing?.id !== record.id ||
              existing.localKeyId !== record.localKeyId ||
              existing.appIdentifier !== record.appIdentifier
            );
          }),
        ),
      );
    });
  }

  private async cleanupUsers(): Promise<string[]> {
    const raw = await this.requireHost().cleanupStorage.read();
    if (!raw) {
      return [];
    }
    try {
      const value = JSON.parse(raw);
      return Array.isArray(value) ? value.filter(item => typeof item === 'string' && item) : [];
    } catch {
      return [];
    }
  }

  private async updateCleanup(update: (users: string[]) => string[]): Promise<void> {
    await this.serialized(async () =>
      this.requireHost().cleanupStorage.write(JSON.stringify(update(await this.cleanupUsers()))),
    );
  }

  private validateChallenge(
    challenge: BiometricCredentialChallengeJSON | null,
    id?: string,
  ): asserts challenge is BiometricCredentialChallengeJSON {
    if (
      !challenge ||
      challenge.algorithm !== 'ES256' ||
      typeof challenge.client_data !== 'string' ||
      !challenge.client_data ||
      (id && challenge.trusted_device_id && challenge.trusted_device_id !== id)
    ) {
      throw fail('invalid_biometric_challenge');
    }
    const expires = challenge.expires_at > 10_000_000_000 ? challenge.expires_at : challenge.expires_at * 1000;
    if (!Number.isFinite(expires) || expires <= Date.now()) {
      throw fail('expired_biometric_challenge');
    }
  }

  private validateSignature(signature: Signature, challenge: BiometricCredentialChallengeJSON): void {
    if (signature.clientData !== challenge.client_data || signature.algorithm !== 'ES256' || !signature.signature) {
      throw fail('invalid_biometric_signature');
    }
  }

  private credential(value: CredentialJSON): BiometricCredential {
    if (!value || !value.id || !Number.isFinite(value.created_at) || !Number.isFinite(value.updated_at)) {
      throw fail('invalid_biometric_response');
    }
    return {
      id: value.id,
      object: value.object,
      platform: value.platform,
      appIdentifier: value.app_identifier,
      name: value.name ?? null,
      algorithm: value.algorithm,
      status: value.status,
      createdAt: new Date(value.created_at),
      updatedAt: new Date(value.updated_at),
      lastUsedAt: value.last_used_at == null ? null : new Date(value.last_used_at),
      revokedAt: value.revoked_at == null ? null : new Date(value.revoked_at),
    };
  }

  private async request<T>(
    path: string,
    method: string,
    body?: Record<string, unknown>,
    sessionId?: string,
  ): Promise<T> {
    const response = await BaseResource._fetch<T>({ path, method, body: body as any, sessionId });
    if (!response) {
      throw fail('invalid_biometric_response');
    }
    return response.response;
  }
  private requireHost(): NativeBiometricHost {
    if (!this.host) {
      throw fail('capability_unavailable:biometrics');
    }
    return this.host;
  }
  private assertCurrent(generation: number): void {
    if (generation !== this.#generation) {
      throw fail('stale_authentication_attempt');
    }
  }
  private serialized<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.#writes.then(operation);
    this.#writes = result.catch(() => undefined);
    return result;
  }
}
