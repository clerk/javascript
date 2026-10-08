import { isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { useClerk } from '@clerk/shared/react';

import { useAuthCodeRequestScopeModel } from '@/ui/common/auth-code-request-scope.model';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router/RouteContext';
import { navigateOnSignInProtectGate } from './handleProtectCheck';
import { useResetPasswordFactor } from './useResetPasswordFactor';

export function useSignInFactorOnePasswordModel() {
  const clerk = useClerk();
  const signIn = useCoreSignIn();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const supportEmail = useSupportEmail();
  const resetPasswordFactor = useResetPasswordFactor();
  const { navigate } = useRouter();

  const scope = useAuthCodeRequestScopeModel('signIn', signIn, 'password');

  const attempt = (password: string) =>
    scope.run(async () => {
      try {
        const result = await signIn.attemptFirstFactor({ strategy: 'password', password });
        if (!scope.canRun()) {
          return;
        }
        if (navigateOnSignInProtectGate(result, navigate, '../protect-check')) {
          return;
        }
        switch (result.status) {
          case 'complete':
            return clerk.setActive({
              session: result.createdSessionId,
              navigate: ({ session, decorateUrl }) =>
                navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl }),
            });
          case 'needs_second_factor':
            return navigate('../factor-two');
          case 'needs_client_trust':
            return navigate('../client-trust');
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
    identifier: signIn.identifier,
    avatarUrl: signIn.userData.imageUrl,
    hasResetPasswordFactor: Boolean(resetPasswordFactor),
    goBack: () => void navigate('../'),
    attempt,
  };
}
