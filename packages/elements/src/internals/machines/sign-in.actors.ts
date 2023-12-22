import type {
  AttemptFirstFactorParams,
  AttemptSecondFactorParams,
  LoadedClerk,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  SignInResource,
} from '@clerk/types';
import { fromPromise } from 'xstate';

import type { SignInMachineContext } from './sign-in.machine';
import type { SignInResourceParams } from './sign-in.types';

export const createSignIn = fromPromise<
  SignInResource,
  { client: LoadedClerk['client']; fields: SignInMachineContext['fields'] }
>(({ input: { client, fields } }) => {
  const password = fields.get('password');
  const identifier = fields.get('identifier');

  if (!identifier) {
    throw new Error('Identifier field not present'); // TODO: better error
  }

  const passwordParams = password?.value
    ? {
        password: password.value,
        strategy: 'password',
      }
    : {};

  return client.signIn.create({
    identifier: identifier.value as string,
    ...passwordParams,
  });
});

export const prepareFirstFactor = fromPromise<SignInResource, SignInResourceParams<PrepareFirstFactorParams | null>>(
  async ({ input: { client, params } }) => {
    if (!params) {
      throw new Error('Unable to prepare first factor: no factor provided'); // TODO: better error
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
