import { useCallback, useRef, useState } from 'react';

import type { ClerkAPIResponseError } from '../../errors/clerkApiResponseError';
import { ClerkRuntimeError } from '../../errors/clerkRuntimeError';
import { eventMethodCalled } from '../../telemetry/events/method-called';
import type {
  LookupOAuthDeviceVerificationParams,
  OAuthDeviceVerificationInfo,
  OAuthDeviceVerificationResult,
  SubmitOAuthDeviceVerificationParams,
} from '../../types';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import type { UseOAuthDeviceVerificationReturn } from './useOAuthDeviceVerification.types';

const HOOK_NAME = 'useOAuthDeviceVerification';
type HookError = ClerkAPIResponseError | ClerkRuntimeError;
type DecisionParams = Omit<SubmitOAuthDeviceVerificationParams, 'approved'>;
type PendingLookup = {
  key: string;
  promise: Promise<OAuthDeviceVerificationInfo>;
};
type PendingSubmit = {
  key: string;
  promise: Promise<OAuthDeviceVerificationResult>;
};

const normalizeUserCode = (userCode: string) => userCode.toUpperCase().replace(/[-\p{White_Space}]/gu, '');

const createNotReadyError = () =>
  new ClerkRuntimeError('Clerk must be loaded before using OAuth device verification.', {
    code: 'oauth_device_verification_not_ready',
  });

const createLookupInProgressError = () =>
  new ClerkRuntimeError('An OAuth device verification lookup is already in progress for another code.', {
    code: 'oauth_device_verification_lookup_in_progress',
  });

const createSubmissionInProgressError = () =>
  new ClerkRuntimeError('Another OAuth device verification decision is already in progress.', {
    code: 'oauth_device_verification_submission_in_progress',
  });

/**
 * Provides state and actions for building a custom OAuth device verification flow.
 *
 * @returns The current verification state and methods for looking up, approving, denying, or resetting a request.
 *
 * @example
 * ### Look up a device authorization request
 *
 * ```tsx
 * import { useOAuthDeviceVerification } from '@clerk/react';
 *
 * function CustomDeviceVerification({ userCode }: { userCode: string }) {
 *   const { data, isLoading, lookup } = useOAuthDeviceVerification();
 *
 *   const handleLookup = async () => {
 *     await lookup({ userCode });
 *   };
 *
 *   return (
 *     <>
 *       <button disabled={isLoading} onClick={handleLookup}>Verify code</button>
 *       {data && <p>Authorize {data.oauthApplicationName}?</p>}
 *     </>
 *   );
 * }
 * ```
 */
export function useOAuthDeviceVerification(): UseOAuthDeviceVerificationReturn {
  useAssertWrappedByClerkProvider(HOOK_NAME);
  const clerk = useClerkInstanceContext();
  const [data, setData] = useState<OAuthDeviceVerificationInfo>();
  const [result, setResult] = useState<OAuthDeviceVerificationResult>();
  const [error, setError] = useState<HookError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingLookup = useRef<PendingLookup | null>(null);
  const pendingSubmit = useRef<PendingSubmit | null>(null);
  const generation = useRef(0);

  clerk.telemetry?.record(eventMethodCalled(HOOK_NAME));

  const lookup = useCallback(
    (params: LookupOAuthDeviceVerificationParams) => {
      const oauthApplication = clerk.loaded ? clerk.oauthApplication : undefined;
      if (!oauthApplication) {
        return Promise.reject(createNotReadyError());
      }

      const key = normalizeUserCode(params.userCode);
      if (pendingLookup.current) {
        if (pendingLookup.current.key === key) {
          return pendingLookup.current.promise;
        }
        return Promise.reject(createLookupInProgressError());
      }

      const requestGeneration = generation.current;
      setError(null);
      setData(undefined);
      setResult(undefined);
      setIsLoading(true);

      const request = oauthApplication
        .lookupDeviceVerification({ ...params, userCode: key })
        .then(info => {
          if (generation.current === requestGeneration) {
            setData(info);
          }
          return info;
        })
        .catch((err: HookError) => {
          if (generation.current === requestGeneration) {
            setError(err);
          }
          throw err;
        })
        .finally(() => {
          if (pendingLookup.current?.promise === request) {
            pendingLookup.current = null;
          }
          if (generation.current === requestGeneration) {
            setIsLoading(false);
          }
        });

      pendingLookup.current = { key, promise: request };
      return request;
    },
    [clerk],
  );

  const submit = useCallback(
    (params: DecisionParams, approved: boolean) => {
      const oauthApplication = clerk.loaded ? clerk.oauthApplication : undefined;
      if (!oauthApplication) {
        return Promise.reject(createNotReadyError());
      }

      const userCode = normalizeUserCode(params.userCode);
      const key = JSON.stringify([userCode, params.organizationId ?? null, approved]);
      if (pendingSubmit.current) {
        if (pendingSubmit.current.key === key) {
          return pendingSubmit.current.promise;
        }
        return Promise.reject(createSubmissionInProgressError());
      }

      const requestGeneration = generation.current;
      setError(null);
      setIsSubmitting(true);

      const request = oauthApplication
        .submitDeviceVerification({ ...params, userCode, approved })
        .then(decision => {
          if (generation.current === requestGeneration) {
            setResult(decision);
          }
          return decision;
        })
        .catch((err: HookError) => {
          if (generation.current === requestGeneration) {
            setError(err);
          }
          throw err;
        })
        .finally(() => {
          if (pendingSubmit.current?.promise === request) {
            pendingSubmit.current = null;
          }
          if (generation.current === requestGeneration) {
            setIsSubmitting(false);
          }
        });

      pendingSubmit.current = { key, promise: request };
      return request;
    },
    [clerk],
  );

  const approve = useCallback((params: DecisionParams) => submit(params, true), [submit]);
  const deny = useCallback((params: LookupOAuthDeviceVerificationParams) => submit(params, false), [submit]);

  const reset = useCallback(() => {
    generation.current += 1;
    pendingLookup.current = null;
    pendingSubmit.current = null;
    setData(undefined);
    setResult(undefined);
    setError(null);
    setIsLoading(false);
    setIsSubmitting(false);
  }, []);

  return { data, result, error, isLoading, isSubmitting, lookup, approve, deny, reset };
}
