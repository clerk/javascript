import { isClerkRuntimeError, isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { __internal_WebAuthnAbortService } from '@clerk/shared/internal/clerk-js/passkeys';
import { useClerk } from '@clerk/shared/react';
import type { EnterpriseSSOFactor, SignInFirstFactor, SignInResource } from '@clerk/shared/types';
import { useCallback, useEffect } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { navigateOnSignInProtectGate } from './handleProtectCheck';

/** Search param set when navigating from the start page "Forgot password?" action. */
export const SIGN_IN_RESET_PASSWORD_INTENT_PARAM = '__clerk_reset_password';

/**
 * @param onSecondFactor - invoked when the passkey attempt resolves to a second factor.
 * @param protectCheckPath - route to the protect-check card relative to the caller's mount.
 *   Defaults to the factor-one mount (`'../protect-check'`); `SignInStart` (index route) must pass
 *   `'protect-check'`, otherwise an autofill-triggered, gated passkey sign-in dead-ends at the app
 *   root instead of `/sign-in/protect-check`.
 */
function useHandleAuthenticateWithPasskey(
  onSecondFactor: () => Promise<unknown>,
  protectCheckPath = '../protect-check',
): (...args: Parameters<SignInResource['authenticateWithPasskey']>) => Promise<unknown> {
  const card = useCardState();
  // @ts-expect-error -- private method for the time being
  const { setActive, __internal_navigateWithError } = useClerk();
  const supportEmail = useSupportEmail();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const { authenticateWithPasskey } = useCoreSignIn();
  const { navigate } = useRouter();

  useEffect(() => {
    return () => {
      __internal_WebAuthnAbortService.abort();
    };
  }, []);

  return useCallback(async (...args: Parameters<typeof authenticateWithPasskey>) => {
    try {
      const res = await authenticateWithPasskey(...args);
      // A protect_check gate can fire on attempt_first_factor, which is what
      // authenticateWithPasskey calls under the hood.
      if (navigateOnSignInProtectGate(res, navigate, protectCheckPath)) {
        return;
      }
      switch (res.status) {
        case 'complete':
          return setActive({
            session: res.createdSessionId,
            navigate: async ({ session, decorateUrl }) => {
              await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
            },
          });
        case 'needs_second_factor':
          return onSecondFactor();
        default:
          return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
      }
    } catch (err: any) {
      const { flow } = args[0] || {};

      if (isClerkRuntimeError(err)) {
        // In any case if the call gets aborted we should skip showing an error. This prevents updating the state of unmounted components.
        if (err.code === 'passkey_operation_aborted') {
          return;
        }
        // In case of autofill, if retrieval of credentials is cancelled by the user avoid showing errors as it results to pour UX.
        if (flow === 'autofill' && err.code === 'passkey_retrieval_cancelled') {
          return;
        }
      }

      if (isUserLockedError(err)) {
        return __internal_navigateWithError('..', err.errors[0]);
      }
      handleError(err, [], card.setError);
    }
  }, []);
}

/**
 * Type guard that checks if all factors in the array are enterprise SSO factors
 * with both `enterpriseConnectionId` and `enterpriseConnectionName` properties.
 * This is used to determine if the user should be presented with a choice
 * between multiple enterprise connections.
 * @experimental
 */
function hasMultipleEnterpriseConnections(
  factors: SignInFirstFactor[] | null,
): factors is Array<EnterpriseSSOFactor & { enterpriseConnectionId: string; enterpriseConnectionName: string }> {
  if (!factors?.length) {
    return false;
  }

  return (
    factors.filter(
      factor =>
        factor.strategy === 'enterprise_sso' &&
        'enterpriseConnectionId' in factor &&
        'enterpriseConnectionName' in factor,
    ).length > 1
  );
}

export { hasMultipleEnterpriseConnections, useHandleAuthenticateWithPasskey };
