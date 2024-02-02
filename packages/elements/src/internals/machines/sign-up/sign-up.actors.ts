import { Poller } from '@clerk/shared/poller';
import type {
  AttemptVerificationParams,
  PrepareVerificationParams,
  SignUpCreateParams,
  SignUpResource,
  SignUpUpdateParams,
  SignUpVerificationsResource,
} from '@clerk/types';
import type { SetOptional, Simplify } from 'type-fest';
import { fromCallback, fromPromise } from 'xstate';

import { SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import type { FormFields } from '~/internals/machines/form/form.types';

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

// ================= Verification ================= //

export type PrepareVerificationInput = WithClerk<
  WithParams<PrepareVerificationParams> & { skipIfVerified: keyof SignUpVerificationsResource }
>;

export const prepareVerification = fromPromise<SignUpResource, PrepareVerificationInput>(
  async ({ input: { clerk, params, skipIfVerified: skipKey } }) => {
    if (!clerk.client.signUp.status || clerk.client.signUp.verifications[skipKey].status === 'verified') {
      return Promise.resolve(clerk.client.signUp);
    }

    return await clerk.client.signUp.prepareVerification(params);
  },
);

export type AttemptVerificationInput = WithClerk<WithParams<AttemptVerificationParams>>;

export const attemptVerification = fromPromise<SignUpResource, AttemptVerificationInput>(
  async ({ input: { clerk, params } }) => clerk.client.signUp.attemptVerification(params),
);

// ================= Start / Continue ================= //

export const SignUpAdditionalKeys = [
  'firstName',
  'lastName',
  'emailAddress',
  'username',
  'password',
  'phoneNumber',
] as const;

export type SignUpAdditionalKeys = (typeof SignUpAdditionalKeys)[number];

const updateSignUpKeys = new Set<SignUpAdditionalKeys>(SignUpAdditionalKeys);

function isSignUpParam<T extends SignUpAdditionalKeys>(key: string): key is T {
  return updateSignUpKeys.has(key as T);
}

function fieldsToSignUpParams<T extends SignUpCreateParams | SignUpUpdateParams>(
  fields: FormFields,
): Pick<T, SignUpAdditionalKeys> {
  const params: SignUpUpdateParams = {};

  // TODO: Determine what takes priority

  fields.forEach(({ value }, key) => {
    if (isSignUpParam(key) && value !== undefined) {
      params[key] = value as string;
    }
  });

  return params;
}

export type CreateSignUpInput = WithClerk<{ fields: FormFields }>;
export type UpdateSignUpInput = WithClerk<{ fields: FormFields }>;

export const createSignUp = fromPromise<SignUpResource, CreateSignUpInput>(async ({ input: { clerk, fields } }) => {
  const params = fieldsToSignUpParams(fields);
  return clerk.client.signUp.create(params);
});

export const updateSignUp = fromPromise<SignUpResource, UpdateSignUpInput>(async ({ input: { clerk, fields } }) => {
  const params = fieldsToSignUpParams(fields);

  return clerk.client.signUp.update(params);
});
