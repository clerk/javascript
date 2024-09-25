import { Poller } from '@clerk/shared/poller';
import type { LoadedClerk } from '@clerk/types';
import { fromCallback } from 'xstate';

import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors';

export type VerificationAttemptEmailLinkInput = { clerk: LoadedClerk };
export type VerificationAttemptEmailLinkEvents = { type: 'STOP' };

export const verificationAttemptEmailLink = fromCallback<
  VerificationAttemptEmailLinkEvents,
  VerificationAttemptEmailLinkInput
>(({ receive, sendBack, input: { clerk } }) => {
  const { run, stop } = Poller();

  void run(async () =>
    clerk.client.signUp
      .reload()
      .then(resource => {
        const signInStatus = resource.status;
        const verificationStatus = resource.verifications.emailAddress.status;

        // Short-circuit if the sign-up resource is already complete
        if (signInStatus === 'complete') {
          return sendBack({ type: 'EMAIL_LINK.VERIFIED', resource });
        }

        switch (verificationStatus) {
          case 'verified':
          case 'transferable':
          case 'expired': {
            sendBack({ type: `EMAIL_LINK.${verificationStatus.toUpperCase()}`, resource });
            break;
          }
          case 'failed': {
            sendBack({
              type: 'EMAIL_LINK.FAILED',
              error: new ClerkElementsError('email-link-verification-failed', 'Email verification failed'),
              resource,
            });
            break;
          }
          // case 'unverified':
          default:
            return;
        }

        stop();
      })
      .catch(error => {
        stop();
        new ClerkElementsRuntimeError(error);
      }),
  );

  receive(event => {
    if (event.type === 'STOP') {
      stop();
    }
  });

  return () => stop();
});
