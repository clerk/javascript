import type {
  AttemptFirstFactorParams,
  AttemptSecondFactorParams,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  SignInCreateParams,
  SignInResource,
} from '@clerk/types';
import { fromPromise } from 'xstate';

import type { SignInResourceParams } from './sign-in.types';

export const createSignIn = fromPromise<SignInResource, SignInResourceParams<SignInCreateParams>>(
  async ({ input: { client, params } }) => {
    return client.signIn.create(params);
  },
);

export const prepareFirstFactor = fromPromise<SignInResource, SignInResourceParams<PrepareFirstFactorParams>>(
  async ({ input: { client, params } }) => {
    if (!client.signIn) {
      throw new Error('signIn not available'); // TODO: better error
    }

    return client.signIn.prepareFirstFactor(params);
  },
);

export const attemptFirstFactor = fromPromise<SignInResource, SignInResourceParams<AttemptFirstFactorParams>>(
  async ({ input: { client, params } }) => {
    if (!client.signIn) {
      throw new Error('signIn not available'); // TODO: better error
    }

    return client.signIn.attemptFirstFactor(params);
  },
);

export const prepareSecondFactor = fromPromise<SignInResource, SignInResourceParams<PrepareSecondFactorParams>>(
  async ({ input: { client, params } }) => {
    if (!client.signIn) {
      throw new Error('signIn not available'); // TODO: better error
    }

    return client.signIn.prepareSecondFactor(params);
  },
);

export const attemptSecondFactor = fromPromise<SignInResource, SignInResourceParams<AttemptSecondFactorParams>>(
  async ({ input: { client, params } }) => {
    if (!client.signIn) {
      throw new Error('signIn not available'); // TODO: better error
    }

    return client.signIn.attemptSecondFactor(params);
  },
);

// TODO: Convert to Action
// export const authenticateWithRedirect = fromPromise<SignInResource, SignInResourceParams<AuthenticateWithRedirectParams>>(
//   async ({ input: { client, params } }) => {
//     if (!client.signIn) {
//       throw new Error('signIn not available');
//     }

//     return client.signIn.authenticateWithRedirect(params);
//   },
// );
