import { isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';
import { useCallback } from 'react';

import { useSignInContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { isResetPasswordStrategy } from './utils';

export function useHandleFirstFactorResult() {
  const { setActive } = useClerk();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();

  return useCallback(
    async (res: SignInResource) => {
      switch (res.status) {
        case 'complete':
          return setActive({
            session: res.createdSessionId,
            navigate: async ({ session, decorateUrl }) => {
              await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
            },
          });
        case 'needs_second_factor':
          return navigate('../factor-two');
        case 'needs_client_trust':
          return navigate('../client-trust');
        case 'needs_new_password':
          return navigate('../reset-password');
        default:
          return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
      }
    },
    [setActive, afterSignInUrl, navigateOnSetActive, navigate, supportEmail],
  );
}

export function useHandleSecondFactorResult() {
  const { setActive } = useClerk();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();

  return useCallback(
    async (res: SignInResource) => {
      switch (res.status) {
        case 'complete': {
          const isResettingPassword =
            isResetPasswordStrategy(res.firstFactorVerification?.strategy) &&
            res.firstFactorVerification?.status === 'verified';

          if (isResettingPassword && res.createdSessionId) {
            const queryParams = new URLSearchParams();
            queryParams.set('createdSessionId', res.createdSessionId);
            return navigate(`../reset-password-success?${queryParams.toString()}`);
          }

          return setActive({
            session: res.createdSessionId,
            navigate: async ({ session, decorateUrl }) => {
              await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
            },
          });
        }
        default:
          return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
      }
    },
    [setActive, afterSignInUrl, navigateOnSetActive, navigate, supportEmail],
  );
}

export function useHandleUserLockedError() {
  const clerk = useClerk();

  return useCallback(
    (err: unknown): boolean => {
      if (isUserLockedError(err)) {
        // @ts-expect-error -- private method for the time being
        clerk.__internal_navigateWithError('..', err.errors[0]);
        return true;
      }
      return false;
    },
    [clerk],
  );
}
