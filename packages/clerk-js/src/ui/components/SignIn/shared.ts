import { isClerkRuntimeError, isUserLockedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import { useCallback, useEffect } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { __internal_WebAuthnAbortService } from '../../../utils/passkeys';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';

function useHandleAuthenticateWithPasskey(onSecondFactor: () => Promise<unknown>) {
  const card = useCardState();
  // @ts-expect-error -- private method for the time being
  const { setActive, __internal_navigateWithError } = useClerk();
  const supportEmail = useSupportEmail();
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();
  const { authenticateWithPasskey } = useCoreSignIn();

  useEffect(() => {
    return () => {
      __internal_WebAuthnAbortService.abort();
    };
  }, []);

  return useCallback(async (...args: Parameters<typeof authenticateWithPasskey>) => {
    try {
      const res = await authenticateWithPasskey(...args);
      switch (res.status) {
        case 'complete':
          return setActive({
            session: res.createdSessionId,
            navigate: async ({ session }) => {
              await navigateOnSetActive({ session, redirectUrl: afterSignInUrl });
            },
          });
        case 'needs_second_factor':
          return onSecondFactor();
        default:
          return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
      }
    } catch (err) {
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

export { useHandleAuthenticateWithPasskey };
