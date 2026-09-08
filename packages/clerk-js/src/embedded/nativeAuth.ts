import { ClerkAPIResponseError, ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import type { AuthenticateWithRedirectParams, SignInCreateParams, SignUpCreateParams } from '@clerk/shared/types';

import type { Clerk } from '../core/clerk';
import { SignIn, SignUp } from '../core/resources/internal';
import type { NativePasskeyStage } from '../core/resources/nativePasskeys';
import type { Session } from '../core/resources/Session';
import type { NativeIdentityContext } from './nativeIdentity';

export class NativeAuthOperationError extends Error {
  constructor(
    readonly stage: NativePasskeyStage,
    readonly cause: unknown,
  ) {
    super('Native authentication failed');
  }
}

type AuthResources = Pick<NonNullable<Clerk['client']>, 'signIn' | 'signUp'>;
type Flow = keyof AuthResources;
type CompletionOptions = {
  flow: Flow;
  expectedId?: string;
  transferable?: boolean;
  unsafeMetadata?: SignUpCreateParams['unsafeMetadata'];
};

export function createNativeAuthOperations(clerk: Clerk, identity: NativeIdentityContext) {
  const completed: { [F in Flow]?: { resource: AuthResources[F]; epoch: number } } = {};
  const observe = () => {
    for (const flow of ['signIn', 'signUp'] as const) {
      const saved = completed[flow];
      if (!saved) {
        continue;
      }
      const current = clerk.client?.[flow];
      if (
        saved.epoch !== identity.identityEpoch() ||
        (current?.id && current.id !== saved.resource.id) ||
        !clerk.client?.sessions.some(session => session.id === saved.resource.createdSessionId)
      ) {
        delete completed[flow];
      }
    }
  };
  function completion<R extends AuthResources[Flow]>(resource: R) {
    return resource.status === 'complete' && resource.createdSessionId
      ? { resource, epoch: identity.identityEpoch() }
      : undefined;
  }
  const remember = (value: unknown) => {
    if (value instanceof SignIn) {
      completed.signIn = completion(value);
    } else if (value instanceof SignUp) {
      completed.signUp = completion(value);
    }
  };
  const client = () => {
    if (!clerk.client) {
      throw new ClerkRuntimeError('The client is not initialized', { code: 'not_loaded' });
    }
    return clerk.client;
  };
  const resource = <F extends Flow>(flow: F, expectedId?: string): AuthResources[F] => {
    identity.ensureActive();
    observe();
    const current = clerk.client?.[flow];
    const value = current?.id ? current : (completed[flow]?.resource ?? current);
    if (!value || (expectedId && value.id !== expectedId)) {
      throw new ClerkRuntimeError('The authentication attempt is no longer current', { code: 'stale_authentication' });
    }
    return value;
  };

  async function finish(flow: Flow, expectedId?: string, result?: AuthResources[Flow]) {
    if (result) {
      remember(result);
    }
    const value = resource(flow, expectedId);
    if (value.status === 'complete' && value.createdSessionId && clerk.session?.id !== value.createdSessionId) {
      await identity.commitState();
      resource(flow, value.id);
      await clerk.setActive({ session: value.createdSessionId });
    }
    return value;
  }

  function checkVerificationError(flow: Flow) {
    const error =
      flow === 'signIn'
        ? resource('signIn').firstFactorVerification.error
        : resource('signUp').verifications.externalAccount.error;
    if (error) {
      throw new ClerkAPIResponseError(error.message, { data: [error], status: 422 });
    }
  }

  async function completeNativeAuth(options: CompletionOptions) {
    let flow = options.flow;
    resource(flow, options.expectedId);
    if (
      flow === 'signIn' &&
      resource('signIn').firstFactorVerification.status === 'transferable' &&
      options.transferable !== false
    ) {
      remember(await client().signUp.create({ transfer: true, unsafeMetadata: options.unsafeMetadata }));
      flow = 'signUp';
    } else if (flow === 'signUp' && resource('signUp').verifications.externalAccount.status === 'transferable') {
      remember(await client().signIn.create({ transfer: true }));
      flow = 'signIn';
    }
    checkVerificationError(flow);
    return { kind: flow, resource: await finish(flow) };
  }

  const operations = {
    finishNativeSignIn: (expectedId?: string) => finish('signIn', expectedId),
    finishNativeSignUp: (expectedId?: string) => finish('signUp', expectedId),
    completeNativeAuth,
    async verifyNativeSignInCode(options: { expectedId: string; code: string }) {
      const signIn = resource('signIn', options.expectedId);
      const strategy = signIn.firstFactorVerification.strategy;
      if (!strategy) {
        throw Object.assign(new Error('Unable to verify code because no first factor strategy is set.'), {
          code: 'invalid_strategy',
        });
      }
      if (
        strategy !== 'email_code' &&
        strategy !== 'phone_code' &&
        strategy !== 'reset_password_email_code' &&
        strategy !== 'reset_password_phone_code'
      ) {
        throw Object.assign(new Error(`Unable to verify code for strategy '${strategy}'.`), {
          code: 'invalid_strategy',
        });
      }
      const result = await signIn.attemptFirstFactor({ strategy, code: options.code });
      return finish('signIn', options.expectedId, result);
    },
    async completeNativeRedirectCallback(options: CompletionOptions & { callbackUrl: string }) {
      const value = resource(options.flow, options.expectedId);
      const nonce = new URL(options.callbackUrl).searchParams.get('rotating_token_nonce');
      remember(await value.reload(nonce === null ? undefined : { rotatingTokenNonce: nonce }));
      resource(options.flow, options.expectedId);
      if (nonce !== null) {
        checkVerificationError(options.flow);
        return { kind: options.flow, resource: value };
      }
      return completeNativeAuth(options);
    },
    async verifyNativeSessionPasskey(options: {
      sessionId: string;
      level: 'first_factor' | 'second_factor';
      preferImmediatelyAvailableCredentials?: boolean;
    }) {
      const session = () => {
        const value = client().sessions.find(candidate => candidate.id === options.sessionId);
        if (!value || value.status !== 'active') {
          throw new ClerkRuntimeError('The session is no longer active', { code: 'stale_session' });
        }
        return value as Session;
      };
      return session().verifyWithPasskey({
        level: options.level,
        preferImmediatelyAvailableCredentials: options.preferImmediatelyAvailableCredentials,
        onBeforeAttempt: () => {
          session();
        },
      });
    },
    async authenticateNativePasskey(options: {
      expectedId?: string;
      createNew?: boolean;
      autofill?: boolean;
      preferImmediatelyAvailableCredentials?: boolean;
    }) {
      const signIn = resource('signIn', options.expectedId) as SignIn;
      let stage: NativePasskeyStage = 'preparingFirstFactor';
      let authorizationSignInId: string | undefined;
      try {
        await signIn.authenticateWithPasskey(
          { flow: options.createNew ? 'discoverable' : options.autofill ? 'autofill' : undefined },
          {
            allowSecondFactor: !options.createNew,
            preferImmediatelyAvailableCredentials: options.preferImmediatelyAvailableCredentials,
            onStage: value => {
              stage = value;
              if (value === 'requestingAuthorization') {
                authorizationSignInId = signIn.id;
              } else if (authorizationSignInId) {
                resource('signIn', authorizationSignInId);
              }
            },
          },
        );
        return await finish('signIn', signIn.id, signIn);
      } catch (error) {
        throw new NativeAuthOperationError(stage, error);
      }
    },
    async completeNativeAppleSignIn(options: {
      idToken: string;
      firstName?: string;
      lastName?: string;
      transferable: boolean;
      unsafeMetadata?: SignUpCreateParams['unsafeMetadata'];
    }) {
      const { idToken: token, firstName, lastName, unsafeMetadata, transferable } = options;
      if (!transferable) {
        remember(await client().signIn.create({ strategy: 'oauth_token_apple', token }));
        return completeNativeAuth({ flow: 'signIn', transferable: false });
      }
      try {
        remember(
          await client().signUp.create({ strategy: 'oauth_token_apple', token, firstName, lastName, unsafeMetadata }),
        );
      } catch (error) {
        const restricted =
          isClerkAPIResponseError(error) &&
          error.errors.some(({ code }) => ['sign_up_mode_restricted', 'sign_up_restricted_waitlist'].includes(code));
        if (!restricted) {
          throw error;
        }
        remember(await client().signIn.create({ strategy: 'oauth_token_apple', token }));
        if (resource('signIn').firstFactorVerification.status === 'transferable') {
          throw error;
        }
        return completeNativeAuth({ flow: 'signIn', transferable: false });
      }
      return completeNativeAuth({ flow: 'signUp' });
    },
    async authenticateNativeWithRedirect(options: { flow: Flow; params: AuthenticateWithRedirectParams }) {
      const alternateFlow = options.flow === 'signIn' ? 'signUp' : 'signIn';
      const alternate = resource(alternateFlow);
      const previous = { id: alternate.id, status: alternate.status, sessionId: alternate.createdSessionId };
      const requested = resource(options.flow);
      await requested.authenticateWithRedirect(options.params);
      remember(requested);
      remember(alternate);
      const current = resource(alternateFlow);
      const changed =
        current.id !== previous.id ||
        current.status !== previous.status ||
        current.createdSessionId !== previous.sessionId;
      const primary = resource(options.flow);
      const transferPending =
        options.flow === 'signIn'
          ? resource('signIn').firstFactorVerification.status === 'transferable' &&
            options.params.__internal_callbackParams?.transferable !== false
          : resource('signUp').verifications.externalAccount.status === 'transferable';
      const alternateCompleted =
        current.createdSessionId &&
        current.createdSessionId === clerk.session?.id &&
        current.createdSessionId !== primary.createdSessionId;
      const transferred = current.id && changed && (transferPending || alternateCompleted || !primary.id);
      const flow = transferred ? alternateFlow : options.flow;
      return { kind: flow, resource: await finish(flow) };
    },
    createNativeSignIn: (params: SignInCreateParams) => client().signIn.create(params),
    createNativeSignUp: (params: SignUpCreateParams) => client().signUp.create(params),
    attemptNativeFirstFactor: (options: {
      expectedId: string;
      params: Parameters<NonNullable<Clerk['client']>['signIn']['attemptFirstFactor']>[0];
    }) => {
      return resource('signIn', options.expectedId).attemptFirstFactor(options.params);
    },
  };
  return { operations, remember, observe, finish };
}
