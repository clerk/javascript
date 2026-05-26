import { isClerkRuntimeError } from '@clerk/shared/error';
import { __internal_WebAuthnAbortService } from '@clerk/shared/internal/clerk-js/passkeys';
import type { EnterpriseSSOFactor, SignInFirstFactor } from '@clerk/shared/types';
import { useCallback, useEffect } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import { useCoreSignIn } from '../../contexts';
import { useHandleFirstFactorResult, useHandleUserLockedError } from './useHandleAttemptResult';

function useHandleAuthenticateWithPasskey(onSecondFactor: () => Promise<unknown>) {
  const card = useCardState();
  const { authenticateWithPasskey } = useCoreSignIn();
  const handleFirstFactorResult = useHandleFirstFactorResult();
  const handleUserLockedError = useHandleUserLockedError();

  useEffect(() => {
    return () => {
      __internal_WebAuthnAbortService.abort();
    };
  }, []);

  return useCallback(async (...args: Parameters<typeof authenticateWithPasskey>) => {
    try {
      const res = await authenticateWithPasskey(...args);
      if (res.status === 'needs_second_factor') {
        return onSecondFactor();
      }
      return handleFirstFactorResult(res);
    } catch (err: any) {
      const { flow } = args[0] || {};

      if (isClerkRuntimeError(err)) {
        if (err.code === 'passkey_operation_aborted') {
          return;
        }
        if (flow === 'autofill' && err.code === 'passkey_retrieval_cancelled') {
          return;
        }
      }

      if (handleUserLockedError(err)) {
        return;
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
