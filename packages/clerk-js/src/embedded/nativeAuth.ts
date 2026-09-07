import { ClerkAPIResponseError, ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import type { AuthenticateWithRedirectParams, SignInCreateParams, SignUpCreateParams } from '@clerk/shared/types';

import type { Clerk } from '../core/clerk';

type Flow = 'signIn' | 'signUp';
type CompletionOptions = {
  flow: Flow;
  expectedId?: string;
  transferable?: boolean;
  unsafeMetadata?: SignUpCreateParams['unsafeMetadata'];
};

export function createNativeAuthOperations(clerk: Clerk) {
  const client = () => {
    if (!clerk.client) {
      throw new ClerkRuntimeError('The client is not initialized', { code: 'not_loaded' });
    }
    return clerk.client;
  };
  const resource = (flow: Flow, expectedId?: string) => {
    const value = clerk.client?.[flow];
    if (!value || (expectedId && value.id !== expectedId)) {
      throw new ClerkRuntimeError('The authentication attempt is no longer current', { code: 'stale_authentication' });
    }
    return value;
  };

  async function finish(flow: Flow, expectedId?: string) {
    const value = resource(flow, expectedId);
    if (value.status === 'complete' && value.createdSessionId && clerk.session?.id !== value.createdSessionId) {
      await clerk.setActive({ session: value.createdSessionId });
    }
    return value;
  }

  async function completeNativeAuth(options: CompletionOptions) {
    let flow = options.flow;
    resource(flow, options.expectedId);
    if (
      flow === 'signIn' &&
      client().signIn.firstFactorVerification.status === 'transferable' &&
      options.transferable !== false
    ) {
      await client().signUp.create({ transfer: true, unsafeMetadata: options.unsafeMetadata });
      flow = 'signUp';
    } else if (flow === 'signUp' && client().signUp.verifications.externalAccount.status === 'transferable') {
      await client().signIn.create({ transfer: true });
      flow = 'signIn';
    }
    const error =
      flow === 'signIn'
        ? client().signIn.firstFactorVerification.error
        : client().signUp.verifications.externalAccount.error;
    if (error) {
      throw new ClerkAPIResponseError(error.message, { data: [error], status: 422 });
    }
    return { kind: flow, resource: await finish(flow) };
  }

  return {
    finishNativeSignIn: () => finish('signIn'),
    finishNativeSignUp: () => finish('signUp'),
    completeNativeAuth,
    async completeNativeAppleSignIn(options: {
      idToken: string;
      firstName?: string;
      lastName?: string;
      transferable: boolean;
      unsafeMetadata?: SignUpCreateParams['unsafeMetadata'];
    }) {
      const { idToken: token, firstName, lastName, unsafeMetadata, transferable } = options;
      if (!transferable) {
        await client().signIn.create({ strategy: 'oauth_token_apple', token });
        return completeNativeAuth({ flow: 'signIn', transferable: false });
      }
      try {
        await client().signUp.create({ strategy: 'oauth_token_apple', token, firstName, lastName, unsafeMetadata });
      } catch (error) {
        const restricted =
          isClerkAPIResponseError(error) &&
          error.errors.some(({ code }) => ['sign_up_mode_restricted', 'sign_up_restricted_waitlist'].includes(code));
        if (!restricted) {
          throw error;
        }
        await client().signIn.create({ strategy: 'oauth_token_apple', token });
        if (client().signIn.firstFactorVerification.status === 'transferable') {
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
      await resource(options.flow).authenticateWithRedirect(options.params);
      const current = resource(alternateFlow);
      const changed =
        current.id !== previous.id ||
        current.status !== previous.status ||
        current.createdSessionId !== previous.sessionId;
      const primary = resource(options.flow);
      const transferPending =
        options.flow === 'signIn'
          ? client().signIn.firstFactorVerification.status === 'transferable' &&
            options.params.__internal_callbackParams?.transferable !== false
          : client().signUp.verifications.externalAccount.status === 'transferable';
      const alternateCompleted =
        current.createdSessionId &&
        current.createdSessionId === clerk.session?.id &&
        current.createdSessionId !== primary.createdSessionId;
      const transferred = current.id && changed && (transferPending || alternateCompleted || !primary.id);
      const flow = transferred ? alternateFlow : options.flow;
      return { kind: flow, resource: await finish(flow) };
    },
    createNativeSignIn: (params: SignInCreateParams) => client().signIn.create(params),
    attemptNativeFirstFactor: (options: {
      expectedId: string;
      params: Parameters<NonNullable<Clerk['client']>['signIn']['attemptFirstFactor']>[0];
    }) => {
      resource('signIn', options.expectedId);
      return client().signIn.attemptFirstFactor(options.params);
    },
  };
}
