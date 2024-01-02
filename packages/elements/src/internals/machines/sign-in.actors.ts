import type {
  AttemptFirstFactorParams,
  AttemptSecondFactorParams,
  AuthenticateWithRedirectParams,
  HandleOAuthCallbackParams,
  HandleSamlCallbackParams,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  SignInResource,
} from '@clerk/types';
import { fromPromise } from 'xstate';

import type { ClerkHostRouter } from '../router';
import type { SignInMachineContext } from './sign-in.machine';
import type { WithClerk, WithClient, WithParams } from './sign-in.types';

export const createSignIn = fromPromise<SignInResource, WithClient<{ fields: SignInMachineContext['fields'] }>>(
  ({ input: { client, fields } }) => {
    const password = fields.get('password');
    const identifier = fields.get('identifier');

    if (!identifier) {
      throw new Error('Identifier field not present'); // TODO: better error
    }

    const passwordParams = password
      ? {
          password: password.value,
          strategy: 'password',
        }
      : {};

    return client.signIn.create({
      identifier: identifier.value as string,
      ...passwordParams,
    });
  },
);

export const authenticateWithRedirect = fromPromise<
  void,
  WithClerk<{ strategy: AuthenticateWithRedirectParams['strategy'] | undefined }>
>(async ({ input: { clerk, strategy } }) => {
  if (!strategy) {
    throw new Error('Expected `strategy to be defined');
  }

  return clerk.client.signIn.authenticateWithRedirect({
    strategy,
    redirectUrl: `${clerk.__unstable__environment.displayConfig.signInUrl}/sso-callback`,
    redirectUrlComplete: clerk.buildAfterSignInUrl(),
  });
});

export const prepareFirstFactor = fromPromise<SignInResource, WithClient<WithParams<PrepareFirstFactorParams>>>(
  ({ input }) => input.client.signIn.prepareFirstFactor(input.params),
);

export const attemptFirstFactor = fromPromise<SignInResource, WithClient<WithParams<AttemptFirstFactorParams>>>(
  ({ input }) => input.client.signIn.attemptFirstFactor(input.params),
);

export const prepareSecondFactor = fromPromise<SignInResource, WithClient<WithParams<PrepareSecondFactorParams>>>(
  ({ input }) => input.client.signIn.prepareSecondFactor(input.params),
);

export const attemptSecondFactor = fromPromise<SignInResource, WithClient<WithParams<AttemptSecondFactorParams>>>(
  ({ input }) => input.client.signIn.attemptSecondFactor(input.params),
);

export const handleSSOCallback = fromPromise<
  unknown,
  WithClerk<WithParams<HandleOAuthCallbackParams | HandleSamlCallbackParams> & { router: ClerkHostRouter }>
>(async ({ input }) => {
  return input.clerk.handleRedirectCallback(
    {
      afterSignInUrl: input.clerk.buildAfterSignInUrl(),
      firstFactorUrl: '../factor-one',
      secondFactorUrl: '../factor-two',
      ...input.params,
    },
    // @ts-expect-error - Align on return typing. `void` vs `Promise<unknown>`
    input.router.replace,
  );
});
