import type { Clerk } from '../core/clerk';
import type { AuthConfig } from '../core/resources/AuthConfig';
import { BaseResource } from '../core/resources/Base';
import type { Verification } from '../core/resources/Verification';
import type { NativeIdentityContext } from './nativeIdentity';

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

type LocalCredential = {
  id: string;
  localKeyId: string;
  userId: string;
  appIdentifier: string;
  identifierHint?: string;
  policy: string;
  createdAt: number;
  updatedAt: number;
};
type Selection = { credentials?: LocalCredential[]; reason?: string };
type SelectionOptions = { id?: string; identifierHint?: string; currentUser?: boolean };
export type NativeBiometricCapability = (request: Record<string, unknown>) => Promise<any>;

export function createBiometricCredentialOperations(
  clerk: Clerk,
  capability: NativeBiometricCapability | undefined,
  identity: NativeIdentityContext,
) {
  const fetchResponse = async (request: Parameters<typeof BaseResource._fetch>[0]) =>
    (await BaseResource._fetch(request))?.response;
  const api = {
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
  };
  const native = async (operation: string, args: Record<string, unknown> = {}) => {
    if (!capability) {
      throw new Error('Biometric sign-in is unavailable.');
    }
    return capability({ operation, ...args });
  };
  const fence = () => {
    const epoch = identity.identityEpoch();
    const session = clerk.session?.id;
    return () => {
      identity.ensureActive();
      if (identity.identityEpoch() !== epoch || clerk.session?.id !== session) {
        throw new Error('The identity changed during biometric authentication.');
      }
    };
  };
  const remove = (credential: LocalCredential) => native('remove', { credential });
  const missingCredential = (error: any) => {
    const entry = error?.errors?.[0];
    return (
      ['form_resource_not_found', 'trusted_device_not_registered'].includes(entry?.code) &&
      (entry.meta?.paramName || entry.meta?.param_name) === 'trusted_device_id'
    );
  };
  const featureUnavailableReason = () => {
    const settings = (clerk.__internal_environment?.authConfig as AuthConfig | undefined)?.nativeSettings;
    if (!settings) {
      return 'environmentUnavailable';
    }
    if (!settings.api_enabled) {
      return 'nativeAPIDisabled';
    }
    if (!settings.biometric_sign_in_enabled) {
      return 'featureDisabled';
    }
    return undefined;
  };
  const candidates = (options: SelectionOptions): Promise<Selection> => {
    if (options.currentUser && !clerk.user?.id) {
      return Promise.resolve({ reason: 'noLocalCredential' });
    }
    const reason = featureUnavailableReason();
    if (reason) {
      return Promise.resolve({ reason });
    }
    return native('candidates', {
      id: options.id,
      identifierHint: options.identifierHint,
      userID: options.currentUser ? clerk.user?.id : undefined,
    });
  };
  const select = async (options: SelectionOptions): Promise<Selection> => {
    const check = fence();
    const local = await candidates(options);
    check();
    if (!local.credentials?.length || clerk.session?.status !== 'active' || !clerk.session.user.id) {
      return local;
    }
    const matching = local.credentials.filter(entry => entry.userId === clerk.session?.user.id);
    if (!matching.length) {
      return { reason: 'noLocalCredential' };
    }
    const server = (await api.listNativeBiometricCredentials()) as unknown as any[];
    check();
    let reason: string | undefined;
    for (const entry of matching) {
      const credential = server.find(value => value.id === entry.id);
      if (credential?.status === 'active') {
        return { credentials: [entry] };
      }
      await remove(entry);
      check();
      reason ||= credential ? 'serverCredentialRevoked' : 'serverCredentialMissing';
    }
    return { reason: reason || 'serverCredentialMissing' };
  };
  const challengeData = (challenge: any): string => {
    if (
      typeof challenge?.client_data !== 'string' ||
      typeof challenge?.challenge !== 'string' ||
      typeof challenge?.challenge_id !== 'string' ||
      typeof challenge?.expires_at !== 'number' ||
      challenge?.algorithm !== 'ES256'
    ) {
      throw new Error('Biometric authentication did not return a supported challenge.');
    }
    return challenge.client_data;
  };
  const requireEnrollmentSession = (action: string) => {
    const session = clerk.session;
    if (!session || !['active', 'pending'].includes(session.status)) {
      throw new Error(`Unable to ${action} a biometric credential without an active or pending Clerk session.`);
    }
    return session;
  };
  const revoke = async (id: string, sessionId = clerk.session?.id) => {
    const check = fence();
    const result = await api.revokeNativeBiometricCredential(id, sessionId);
    check();
    await native('removeById', { id }).catch(() => undefined);
    return result;
  };
  return {
    listNativeBiometricCredentials: api.listNativeBiometricCredentials,
    nativeBiometricAvailability: async (options: SelectionOptions = {}) => {
      const result = await select(options);
      return { reason: result.reason || null };
    },
    enrollNativeBiometricCredential: async (
      options: { name?: string; identifierHint?: string; reason?: string; policy?: string } = {},
    ) => {
      const session = requireEnrollmentSession('enroll');
      const check = fence();
      const device = await native('context');
      check();
      const reason = featureUnavailableReason();
      if (reason) {
        const messages: Record<string, string> = {
          environmentUnavailable: 'Unable to use biometric sign-in before the Clerk environment is loaded.',
          nativeAPIDisabled: 'Unable to use biometric sign-in because Native API is disabled.',
          featureDisabled: 'Unable to use biometric sign-in because it is disabled.',
        };
        throw new Error(messages[reason] || 'Biometric sign-in is unavailable.');
      }
      if (!device.appIdentifier) {
        throw new Error('Unable to enroll a biometric credential without a bundle identifier.');
      }
      if (!session.user.id) {
        throw new Error('Unable to enroll a biometric credential without a user for the current session.');
      }
      const userId = session.user.id;
      const key = await native('createKey', { policy: options.policy || 'biometry_current_set' });
      try {
        check();
        const params = {
          platform: device.platform,
          appIdentifier: device.appIdentifier,
          name: options.name,
          algorithm: key.algorithm,
          publicKeyJWK: key.publicKeyJWK,
        };
        const challenge = await api.prepareNativeBiometricEnrollment(session.id, params);
        check();
        const signature = await native('sign', {
          clientData: challengeData(challenge),
          localKeyId: key.localKeyId,
          reason: options.reason ?? 'Use biometrics to enroll this device.',
        });
        check();
        const credential = (await api.attemptNativeBiometricEnrollment(session.id, { ...params, ...signature })) as any;
        check();
        try {
          await native('save', {
            credential: {
              id: credential.id,
              localKeyId: key.localKeyId,
              userId,
              appIdentifier: credential.app_identifier,
              identifierHint: options.identifierHint,
              policy: key.policy,
              createdAt: credential.created_at,
              updatedAt: credential.updated_at,
            },
          });
          check();
        } catch (error) {
          await api.revokeNativeBiometricCredential(credential.id, session.id).catch(() => undefined);
          throw error;
        }
        const previous: LocalCredential[] = await native('records').catch(() => []);
        for (const entry of previous) {
          check();
          if (entry.id !== credential.id) {
            await remove(entry).catch(() => undefined);
          }
        }
        return credential;
      } catch (error) {
        await native('deleteKey', { localKeyId: key.localKeyId }).catch(() => undefined);
        throw error;
      }
    },
    revokeNativeBiometricCredentialAndForget: revoke,
    revokeCurrentNativeBiometricCredential: async () => {
      requireEnrollmentSession('revoke');
      const result = await select({ currentUser: true });
      return result.credentials?.[0] ? revoke(result.credentials[0].id) : null;
    },
    signInWithNativeBiometricCredential: async (options: SelectionOptions & { reason?: string } = {}) => {
      let check = fence();
      const selection = await select(options);
      const credential = selection.credentials?.[0];
      if (!credential) {
        throw new Error('Biometric sign-in is unavailable.');
      }
      check();
      const signIn = clerk.client?.signIn;
      if (!signIn) {
        throw new Error('The client is not initialized.');
      }
      try {
        await signIn.create({ strategy: 'biometric_credential', trustedDeviceId: credential.id } as any);
        identity.ensureActive();
        check = fence();
        const id = signIn.id;
        await identity.commitState();
        check();
        const challenge = (signIn.firstFactorVerification as Verification).trustedDeviceChallenge;
        if (!challenge) {
          throw new Error('Biometric sign-in did not return a challenge.');
        }
        const signature = await native('sign', {
          clientData: challengeData(challenge),
          localKeyId: credential.localKeyId,
          reason: options.reason ?? 'Use biometrics to sign in.',
        });
        check();
        if (clerk.client?.signIn.id !== id) {
          throw new Error('The authentication attempt is no longer current.');
        }
        return await signIn.attemptFirstFactor({
          strategy: 'biometric_credential',
          trustedDeviceId: credential.id,
          ...signature,
        });
      } catch (error) {
        check();
        if (missingCredential(error)) {
          await remove(credential).catch(() => undefined);
          throw new Error('This device is no longer trusted. Sign in another way to enroll it again.');
        }
        throw error;
      }
    },
    validateNativeLocalBiometricCredential: async (options: SelectionOptions = {}) => {
      try {
        const check = fence();
        const local = await candidates(options);
        check();
        if (local.reason === 'environmentUnavailable') {
          return { status: 'inconclusive' };
        }
        if (local.reason) {
          return { status: 'invalid', reason: local.reason };
        }
        if (!clerk.client) {
          return { status: 'inconclusive' };
        }
        for (const entry of local.credentials || []) {
          try {
            const validation = (await api.validateNativeBiometricCredential(entry.id)) as any;
            check();
            if (validation.valid) {
              return { status: 'valid' };
            }
          } catch (error: any) {
            check();
            if (!missingCredential(error)) {
              const code = error?.errors?.[0]?.code;
              if (code === 'native_api_disabled' || code === 'feature_not_enabled') {
                return {
                  status: 'invalid',
                  reason: code === 'native_api_disabled' ? 'nativeAPIDisabled' : 'featureDisabled',
                };
              }
              throw error;
            }
          }
          await remove(entry).catch(() => undefined);
          check();
        }
        return { status: 'invalid', reason: 'serverCredentialMissing' };
      } catch {
        return { status: 'inconclusive' };
      }
    },
  };
}
