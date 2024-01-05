import type {
  AttemptFirstFactorParams,
  AttemptSecondFactorParams,
  AuthenticateWithRedirectParams,
  EnvironmentResource,
  HandleOAuthCallbackParams,
  HandleSamlCallbackParams,
  PreferredSignInStrategy,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  SignInFactor,
  SignInFirstFactor,
  SignInResource,
} from '@clerk/types';
import { fromPromise } from 'xstate';

import { ClerkElementsRuntimeError } from '../errors/error';
import type { ClerkRouter } from '../router';
import type { SignInMachineContext } from './sign-in.machine';
import type { FieldDetails, WithClerk, WithClient, WithParams } from './sign-in.types';
import { determineStartingSignInFactor } from './sign-in.utils';
import { assertIsDefined } from './utils/assert';

// ================= createSignIn ================= //

export type CreateSignInInput = WithClient<{ fields: SignInMachineContext['fields'] }>;

export const createSignIn = fromPromise<SignInResource, CreateSignInInput>(({ input: { client, fields } }) => {
  const password = fields.get('password');
  const identifier = fields.get('identifier');

  const passwordParams = password?.value
    ? {
        password: password.value,
        strategy: 'password',
      }
    : {};

  return client.signIn.create({
    identifier: identifier?.value as string,
    ...passwordParams,
  });
});

// ================= authenticateWithRedirect ================= //

export type AuthenticateWithRedirectInput = WithClerk<{
  environment: EnvironmentResource | undefined;
  strategy: AuthenticateWithRedirectParams['strategy'] | undefined;
}>;

export const authenticateWithRedirect = fromPromise<void, AuthenticateWithRedirectInput>(
  async ({ input: { clerk, environment, strategy } }) => {
    assertIsDefined(environment);
    assertIsDefined(strategy);

    return clerk.client.signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: `${environment.displayConfig.signInUrl}/sso-callback`,
      redirectUrlComplete: clerk.buildAfterSignInUrl(),
    });
  },
);

// ================= determineStartingFirstFactor ================= //

export type DetermineStartingFirstFactorInput = {
  supportedFactors: SignInFirstFactor[];
  identifier: string | null;
  preferredStrategy: PreferredSignInStrategy | undefined;
};

export const determineStartingFirstFactor = fromPromise<SignInFactor | null, DetermineStartingFirstFactorInput>(
  async ({ input: { supportedFactors, identifier, preferredStrategy = 'password' } }) => {
    try {
      return Promise.resolve(determineStartingSignInFactor(supportedFactors, identifier, preferredStrategy));
    } catch (e) {
      return Promise.reject(e);
    }
  },
);

// ================= prepareFirstFactor ================= //

export type PrepareFirstFactorInput = WithClient<WithParams<PrepareFirstFactorParams | null>>;

export const prepareFirstFactor = fromPromise<SignInResource, PrepareFirstFactorInput>(
  async ({ input: { client, params } }) => {
    if (!params) {
      throw new ClerkElementsRuntimeError('prepareFirstFactor parameters were undefined');
    }

    return client.signIn.prepareFirstFactor(params);
  },
);

// ================= attemptFirstFactor ================= //

export type AttemptFirstFactorInput = WithClient<
  WithParams<{ fields: Map<string, FieldDetails>; currentFactor: SignInFirstFactor | null }>
>;

export const attemptFirstFactor = fromPromise<SignInResource, AttemptFirstFactorInput>(
  async ({
    input: {
      client,
      params: { fields, currentFactor },
    },
  }) => {
    assertIsDefined(currentFactor);

    let params;

    if (currentFactor.strategy === 'password') {
      params = {
        strategy: 'password',
        password: fields.get('password')?.value as string,
      };
    } else {
      params = {
        strategy: currentFactor.strategy,
        code: fields.get('code')?.value as string,
      };
    }

    return client.signIn.attemptFirstFactor(params as AttemptFirstFactorParams);
  },
);

// ================= prepareSecondFactor ================= //

export type PrepareSecondFactorInput = WithClient<WithParams<PrepareSecondFactorParams>>;

export const prepareSecondFactor = fromPromise<SignInResource, PrepareSecondFactorInput>(({ input }) =>
  input.client.signIn.prepareSecondFactor(input.params),
);

// ================= attemptSecondFactor ================= //

export type AttemptSecondFactorInput = WithClient<WithParams<AttemptSecondFactorParams>>;

export const attemptSecondFactor = fromPromise<SignInResource, AttemptSecondFactorInput>(({ input }) =>
  input.client.signIn.attemptSecondFactor(input.params),
);

// ================= handleSSOCallback ================= //

export type HandleSSOCallbackInput = WithClerk<
  WithParams<HandleOAuthCallbackParams | HandleSamlCallbackParams> & { router: ClerkRouter }
>;

export const handleSSOCallback = fromPromise<unknown, HandleSSOCallbackInput>(async ({ input }) => {
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
