import { Poller } from '@clerk/shared/poller';
import type { PrepareEmailAddressVerificationParams, SignUpResource } from '@clerk/types';
import type { SetOptional, Simplify } from 'type-fest';
import { fromCallback, fromPromise } from 'xstate';

import { SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import type { FormMachineContext } from '~/internals/machines/form/form.machine';

import type {
  AuthenticateWithRedirectOAuthParams,
  AuthenticateWithRedirectSamlParams,
  WithClerk,
  WithParams,
  WithUnsafeMetadata,
} from '../shared.types';

// ================= startSignUpEmailLinkFlow ================= //

export type StartSignUpEmailLinkFlowEvents = { type: 'STOP' };
export type StartSignUpEmailLinkFlowInput = WithClerk;

export const startSignUpEmailLinkFlow = fromCallback<StartSignUpEmailLinkFlowEvents, StartSignUpEmailLinkFlowInput>(
  ({ receive, sendBack, input: { clerk } }) => {
    const { run, stop } = Poller();

    void run(async () =>
      clerk.client.signUp
        .reload()
        .then(resource => {
          const status = resource.verifications.emailAddress.status;

          if (status === 'verified' || status === 'expired') {
            stop();
            sendBack({ type: `EMAIL_LINK.${status.toUpperCase()}`, resource });
          }
        })
        .catch(error => sendBack({ type: 'EMAIL_LINK.FAILURE', error })),
    );

    receive(event => {
      if (event.type === 'STOP') {
        stop();
      }
    });

    return () => stop();
  },
);

// ================= authenticateWithSignUpRedirect ================= //

export type AuthenticateWithRedirectSignUpParams = SetOptional<
  WithUnsafeMetadata<AuthenticateWithRedirectOAuthParams> | WithUnsafeMetadata<AuthenticateWithRedirectSamlParams>,
  'redirectUrl' | 'redirectUrlComplete'
>;

export type AuthenticateWithRedirectSignUpInput = Simplify<WithClerk<WithParams<AuthenticateWithRedirectSignUpParams>>>;

export const authenticateWithSignUpRedirect = fromPromise<void, AuthenticateWithRedirectSignUpInput>(
  async ({ input: { clerk, params } }) =>
    clerk.client.signUp.authenticateWithRedirect({
      redirectUrl: params.redirectUrl || clerk.buildUrlWithAuth(`/sign-up${SSO_CALLBACK_PATH_ROUTE}`),
      redirectUrlComplete: params.redirectUrlComplete || clerk.buildAfterSignUpUrl(),
      ...params,
    }),
);

// ================= preparePhoneNumberVerification ================= //

export type PreparePhoneNumberVerificationInput = WithClerk;

export const preparePhoneNumberVerification = fromPromise<SignUpResource, PreparePhoneNumberVerificationInput>(
  async ({ input: { clerk } }) =>
    await clerk.client.signUp.prepareVerification({
      strategy: 'phone_code',
    }),
);

// ================= prepareEmailAddressVerification ================= //

export type PrepareEmailAddressVerificationInput = WithClerk<WithParams<PrepareEmailAddressVerificationParams>>;

export const prepareEmailAddressVerification = fromPromise<SignUpResource, PrepareEmailAddressVerificationInput>(
  async ({ input: { clerk, params } }) => await clerk.client.signUp.prepareVerification(params),
);

// ================= prepareWeb3WalletVerification ================= //

export type PrepareWeb3WalletVerificationInput = WithClerk;

export const prepareWeb3WalletVerification = fromPromise<SignUpResource, PrepareWeb3WalletVerificationInput>(
  async ({ input: { clerk } }) => await clerk.client.signUp.prepareWeb3WalletVerification(),
);

// ================= createSignIn ================= //

export type CreateSignUpInput = WithClerk<{ fields: FormMachineContext['fields'] }>;

export const createSignUp = fromPromise<SignUpResource, CreateSignUpInput>(async ({ input: { clerk, fields } }) => {
  const emailAddress = fields.get('emailAddress');
  const phoneNumber = fields.get('phoneNumber');

  const firstName = fields.get('firstName');
  const lastName = fields.get('lastName');
  const username = fields.get('username');
  const password = fields.get('password');

  // TODO: Determine which takes priority

  return clerk.client.signUp.create({
    firstName: firstName?.value as string,
    lastName: lastName?.value as string,
    emailAddress: emailAddress?.value as string,
    username: username?.value as string,
    password: password?.value as string,
    phoneNumber: phoneNumber?.value as string,
    // unsafeMetadata: {} as SignUpUnsafeMetadata,
    ...(password?.value
      ? {
          password: password.value as string,
        }
      : {}),
  });
});
