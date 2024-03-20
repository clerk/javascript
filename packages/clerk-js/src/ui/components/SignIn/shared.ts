import { isClerkRuntimeError, isUserLockedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import { useCallback, useEffect } from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { __internal_WebAuthnAbortService } from '../../../utils/passkeys';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useCardState } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { handleError } from '../../utils';

function useHandleAuthenticateWithPasskey() {
  const card = useCardState();
  const { setActive } = useClerk();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const { navigateAfterSignIn } = useSignInContext();
  const { __experimental_authenticateWithPasskey } = useCoreSignIn();

  useEffect(() => {
    return () => {
      __internal_WebAuthnAbortService.abort();
    };
  }, []);

  return useCallback(async (...args: Parameters<typeof __experimental_authenticateWithPasskey>) => {
    try {
      const res = await __experimental_authenticateWithPasskey(...args);
      switch (res.status) {
        case 'complete':
          return setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignIn });
        case 'needs_second_factor':
          return navigate('../factor-two');
        default:
          return console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
      }
    } catch (err) {
      // In case of autofill, if retrieval of credentials is aborted just return to avoid updating state of unmounted components.
      if (isClerkRuntimeError(err) && err.code === 'passkey_retrieval_aborted') {
        return;
      }
      if (isUserLockedError(err)) {
        // @ts-expect-error -- private method for the time being
        return clerk.__internal_navigateWithError('..', err.errors[0]);
      }
      handleError(err, [], card.setError);
    }
  }, []);
}

export { useHandleAuthenticateWithPasskey };
