import { isClerkAPIResponseError, isClerkRuntimeError, isUserLockedError } from '@clerk/shared/error';
import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import { __internal_WebAuthnAbortService } from '@clerk/shared/internal/clerk-js/passkeys';
import { useClerk } from '@clerk/shared/react';
import type { AuthenticateWithPasskeyParams, SignInResource } from '@clerk/shared/types';
import { useCallback, useEffect, useRef } from 'react';

import { useAuthenticationRequestScopeModel } from '@/ui/common/authentication-request-scope.model';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { navigateOnSignInProtectGate } from './handleProtectCheck';

export const useSignInPasskeyModel = (
  onSecondFactor: () => Promise<unknown>,
  protectCheckPath = '../protect-check',
) => {
  const clerk = useClerk();
  const signIn = useCoreSignIn();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const supportEmail = useSupportEmail();
  const { navigate } = useRouter();
  const { requestKey, canRun } = useAuthenticationRequestScopeModel('signIn', signIn, `passkey:${protectCheckPath}`);
  const pending = useRef(0);
  const latestRequest = useRef<object>();
  useEffect(
    () => () => {
      if (pending.current) {
        __internal_WebAuthnAbortService.abort();
      }
    },
    [requestKey],
  );
  const authenticateWithPasskey = useCallback(
    async (params?: AuthenticateWithPasskeyParams) => {
      if (!canRun()) {
        return;
      }
      const request = {};
      latestRequest.current = request;
      const isCurrent = () => canRun() && latestRequest.current === request;
      pending.current++;
      try {
        let result: SignInResource;
        try {
          result = await signIn.authenticateWithPasskey(params);
        } finally {
          pending.current--;
        }
        if (!isCurrent()) {
          return;
        }
        if (navigateOnSignInProtectGate(result, navigate, protectCheckPath)) {
          return;
        }
        switch (result.status) {
          case 'complete':
            await clerk.setActive({
              session: result.createdSessionId,
              navigate: async ({ session, decorateUrl }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
              },
            });
            return;
          case 'needs_second_factor':
            await onSecondFactor();
            return;
          default:
            console.error(clerkInvalidFAPIResponse(result.status, supportEmail));
        }
      } catch (error) {
        if (!isCurrent()) {
          return;
        }
        if (
          isClerkRuntimeError(error) &&
          (error.code === 'passkey_operation_aborted' ||
            (params?.flow === 'autofill' &&
              (error.code === 'passkey_retrieval_cancelled' || error.code === 'passkey_invalid_rpID_or_domain')))
        ) {
          return;
        }
        if (isClerkAPIResponseError(error) && isUserLockedError(error)) {
          const internal = clerk as typeof clerk & {
            __internal_navigateWithError: (path: string, error: unknown) => Promise<void>;
          };
          await internal.__internal_navigateWithError('..', error.errors[0]);
          return;
        }
        throw error;
      }
    },
    [
      canRun,
      signIn,
      navigate,
      protectCheckPath,
      clerk,
      navigateOnSetActive,
      afterSignInUrl,
      onSecondFactor,
      supportEmail,
    ],
  );
  return { requestKey, canRun, authenticateWithPasskey };
};
