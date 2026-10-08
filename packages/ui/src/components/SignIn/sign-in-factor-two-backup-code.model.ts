import { isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';

import { useAuthCodeRequestScopeModel } from '@/ui/common/auth-code-request-scope.model';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { navigateOnSignInProtectGate } from './handleProtectCheck';
import { isResetPasswordStrategy } from './utils';

const isResettingPassword = (resource: SignInResource) =>
  isResetPasswordStrategy(resource.firstFactorVerification?.strategy) &&
  resource.firstFactorVerification?.status === 'verified';

export function useSignInFactorTwoBackupCodeModel() {
  const signIn = useCoreSignIn();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const clerk = useClerk();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();

  const scope = useAuthCodeRequestScopeModel('signIn', signIn, 'backup_code');

  const attempt = (code: string) =>
    scope.run(async () => {
      try {
        const result = await signIn.attemptSecondFactor({ strategy: 'backup_code', code });
        if (!scope.canRun()) {
          return;
        }
        if (navigateOnSignInProtectGate(result, navigate, '../protect-check')) {
          return;
        }
        switch (result.status) {
          case 'complete':
            if (isResettingPassword(result) && result.createdSessionId) {
              const queryParams = new URLSearchParams();
              queryParams.set('createdSessionId', result.createdSessionId);
              return navigate(`../reset-password-success?${queryParams.toString()}`);
            }
            return clerk.setActive({
              session: result.createdSessionId,
              navigate: async ({ session, decorateUrl }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
              },
            });
          default:
            return console.error(clerkInvalidFAPIResponse(result.status, supportEmail));
        }
      } catch (error) {
        if (!scope.canRun()) {
          return;
        }
        if (isUserLockedError(error)) {
          // @ts-expect-error -- private method for the time being
          return clerk.__internal_navigateWithError('..', error.errors[0]);
        }
        throw error;
      }
    });

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    isResettingPassword: isResettingPassword(signIn),
    attempt,
  };
}
