import { Poller } from '@clerk/shared/poller';
import type {
  AttemptVerificationParams,
  PrepareVerificationParams,
  SignUpResource,
  SignUpVerificationsResource,
} from '@clerk/types';
import { fromCallback, fromPromise } from 'xstate';

import { ClerkElementsError } from '~/internals/errors';
import type { FormFields } from '~/internals/machines/form/form.types';
import { fieldsToSignUpParams } from '~/internals/machines/sign-up/utils';

import type { WithClerk, WithClient, WithParams } from '../shared.types';

// ================= startSignUpEmailLinkFlow ================= //

export type StartSignUpEmailLinkFlowEvents = { type: 'STOP' };
export type StartSignUpEmailLinkFlowInput = WithClerk;

export const startSignUpEmailLinkFlow = fromCallback<StartSignUpEmailLinkFlowEvents, StartSignUpEmailLinkFlowInput>(
  ({ receive, sendBack, input: { clerk } }) => {
    const { run, stop } = Poller();

    void run(async () =>
      clerk.client.signUp.reload().then(resource => {
        stop();
        const status = resource.verifications.emailAddress.status;

        if (status) {
          return sendBack({ type: `EMAIL_LINK.${status?.toUpperCase()}`, resource });
        } else {
          throw new ClerkElementsError('verify-email-link-missing-status', 'No email verification status found');
        }
      }),
    );

    receive(event => {
      if (event.type === 'STOP') {
        stop();
      }
    });

    return () => stop();
  },
);

// ================= Verification ================= //

export type PrepareVerificationInput = WithClient<
  WithParams<PrepareVerificationParams> & { skipIfVerified: keyof SignUpVerificationsResource }
>;

export const prepareVerification = fromPromise<SignUpResource, PrepareVerificationInput>(
  ({ input: { client, params, skipIfVerified: skipKey } }) => {
    if (!client.signUp.status || client.signUp.verifications[skipKey].status === 'verified') {
      return Promise.resolve(client.signUp);
    }

    return client.signUp.prepareVerification(params);
  },
);

export type AttemptVerificationInput = WithClient<WithParams<AttemptVerificationParams>>;

export const attemptVerification = fromPromise<SignUpResource, AttemptVerificationInput>(
  ({ input: { client, params } }) => client.signUp.attemptVerification(params),
);

// ================= Start / Continue ================= //

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
