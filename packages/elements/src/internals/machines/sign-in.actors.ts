import type {
  AttemptFirstFactorParams,
  AuthenticateWithRedirectParams,
  EmailCodeAttempt,
  HandleOAuthCallbackParams,
  HandleSamlCallbackParams,
  PasswordAttempt,
  PhoneCodeAttempt,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  ResetPasswordEmailCodeAttempt,
  ResetPasswordPhoneCodeAttempt,
  SignInFirstFactor,
  SignInResource,
  SignInSecondFactor,
  Web3Attempt,
} from '@clerk/types';
import { fromPromise } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import type { ClerkRouter } from '~/react/router';

import type { FormFields } from './form.types';
import type { WithClerk, WithClient, WithParams } from './shared.types';
import { assertIsDefined } from './utils/assert';

// ================= createSignIn ================= //

export type CreateSignInInput = WithClient<{ fields: FormFields }>;

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
  strategy: AuthenticateWithRedirectParams['strategy'] | undefined;
}>;

export const authenticateWithRedirect = fromPromise<void, AuthenticateWithRedirectInput>(
  async ({ input: { clerk, strategy } }) => {
    assertIsDefined(clerk.__unstable__environment);
    assertIsDefined(strategy);

    return clerk.client.signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: `${clerk.__unstable__environment.displayConfig.signInUrl}/sso-callback`,
      redirectUrlComplete: clerk.buildAfterSignInUrl(),
    });
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
  WithParams<{ fields: FormFields; currentFactor: SignInFirstFactor | null }>
>;

export const attemptFirstFactor = fromPromise<SignInResource, AttemptFirstFactorInput>(
  async ({
    input: {
      client,
      params: { fields, currentFactor },
    },
  }) => {
    assertIsDefined(currentFactor);

    let attemptParams: AttemptFirstFactorParams;

    const strategy = currentFactor.strategy;
    const code = fields.get('code')?.value as string | undefined;
    const password = fields.get('password')?.value as string | undefined;

    switch (strategy) {
      case 'password': {
        assertIsDefined(password);

        attemptParams = {
          strategy,
          password,
        } satisfies PasswordAttempt;

        break;
      }
      case 'reset_password_phone_code':
      case 'reset_password_email_code': {
        assertIsDefined(code);
        assertIsDefined(password);

        attemptParams = {
          strategy,
          code,
          password,
        } satisfies ResetPasswordPhoneCodeAttempt | ResetPasswordEmailCodeAttempt;

        break;
      }
      case 'phone_code':
      case 'email_code': {
        assertIsDefined(code);

        attemptParams = {
          strategy,
          code,
        } satisfies PhoneCodeAttempt | EmailCodeAttempt;

        break;
      }
      case 'web3_metamask_signature': {
        const signature = fields.get('signature')?.value as string | undefined;
        assertIsDefined(signature);

        attemptParams = {
          strategy,
          signature,
        } satisfies Web3Attempt;

        break;
      }
      default:
        throw new ClerkElementsRuntimeError(`Invalid strategy: ${strategy}`);
    }

    return client.signIn.attemptFirstFactor(attemptParams);
  },
);

// ================= prepareSecondFactor ================= //

export type PrepareSecondFactorInput = WithClient<WithParams<PrepareSecondFactorParams | null>>;

export const prepareSecondFactor = fromPromise<SignInResource, PrepareSecondFactorInput>(({ input }) => {
  const currentFactor = input.params;
  assertIsDefined(currentFactor);

  return input.client.signIn.prepareSecondFactor({
    strategy: currentFactor.strategy,
    phoneNumberId: currentFactor.phoneNumberId,
  });
});

// ================= attemptSecondFactor ================= //

export type AttemptSecondFactorInput = WithClient<
  WithParams<{ fields: FormFields; currentFactor: SignInSecondFactor | null }>
>;

export const attemptSecondFactor = fromPromise<SignInResource, AttemptSecondFactorInput>(({ input }) => {
  const code = input.params.fields.get('code')?.value as string;

  assertIsDefined(input.params.currentFactor);
  assertIsDefined(code);

  return input.client.signIn.attemptSecondFactor({
    strategy: input.params.currentFactor.strategy,
    code,
  });
});

// ================= handleSSOCallback ================= //

export type HandleSSOCallbackInput = WithClerk<
  WithParams<HandleOAuthCallbackParams | HandleSamlCallbackParams> & { router: ClerkRouter }
>;

export const handleSSOCallback = fromPromise<unknown, HandleSSOCallbackInput>(async ({ input }) => {
  return input.clerk.handleRedirectCallback(
    {
      afterSignInUrl: input.clerk.buildAfterSignInUrl(),
      firstFactorUrl: '../',
      secondFactorUrl: '../',
      ...input.params,
    },
    // @ts-expect-error - Align on return typing. `void` vs `Promise<unknown>`
    input.router.replace,
  );
});
