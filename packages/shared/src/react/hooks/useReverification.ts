import { useCallback, useRef } from 'react';

import { validateReverificationConfig } from '../../authorization';
import { isReverificationHint, reverificationError } from '../../authorization-errors';
import { ClerkRuntimeError, isClerkAPIResponseError } from '../../error';
import { eventMethodCalled } from '../../telemetry';
import type { Clerk, ReverificationPrefill, ReverificationResult, SessionVerificationLevel } from '../../types';
import { createDeferredPromise } from '../../utils/createDeferredPromise';
import { useClerk } from './useClerk';
import { useSafeLayoutEffect } from './useSafeLayoutEffect';

const CLERK_API_REVERIFICATION_ERROR_CODE = 'session_reverification_required';

/**
 *
 */
async function resolveResult<T>(result: Promise<T> | T): Promise<T | ReturnType<typeof reverificationError>> {
  try {
    const r = await result;
    if (r instanceof Response) {
      return r.json();
    }
    return r;
  } catch (e) {
    // Treat fapi assurance as an assurance hint
    if (isClerkAPIResponseError(e) && e.errors.find(({ code }) => code === CLERK_API_REVERIFICATION_ERROR_CODE)) {
      return reverificationError();
    }

    // rethrow
    throw e;
  }
}

type ExcludeClerkError<T> = T extends { clerk_error: any } ? never : T;

/**
 * @interface
 */
export type NeedsReverificationParameters = {
  /**
   * Marks the reverification process as cancelled and rejects the original request.
   */
  cancel: () => void;
  /**
   * Marks the reverification process as complete and retries the original request.
   * Pass the reverification result, if any.
   */
  complete: (result?: ReverificationResult) => void;
  /**
   * The verification level required for the reverification process.
   */
  level: SessionVerificationLevel | undefined;
  /**
   * What the `prefill` option returned for this request, if set.
   */
  prefill?: ReverificationPrefill;
};

/**
 * The optional options object.
 *
 * @interface
 */
export type UseReverificationOptions<Args extends any[] = any[]> = {
  /**
   * Handler for the reverification process. Opts out of using the default UI. Use this to build a custom UI.
   *
   * @param properties - Callbacks and info to control the reverification flow.
   * @param properties.cancel - A function that will cancel the reverification process.
   * @param properties.complete - A function that will retry the original request after reverification.
   * @param properties.level - The level returned with the reverification hint.
   */
  onNeedsReverification?: (properties: NeedsReverificationParameters) => void;
  /**
   * Returns values the reverification modal reuses instead of asking for them. It's called with the request's
   * arguments when reverification is needed. Today it's used when the user resets a breached or compromised
   * password to reverify: the modal saves `newPassword` with the reset code, so a password change form doesn't
   * ask for its new password twice.
   *
   * @example
   * ```tsx
   * const updatePassword = useReverification(
   *   (reverification, currentUser: UserResource, params: UpdateUserPasswordParams) =>
   *     reverification?.passwordReset ? currentUser.reload() : currentUser.updatePassword(params),
   *   {
   *     passReverificationResult: true,
   *     prefill: (_currentUser, params) => ({
   *       newPassword: params.newPassword,
   *       signOutOfOtherSessions: !!params.signOutOfOtherSessions,
   *     }),
   *   },
   * );
   * ```
   *
   * If it throws, the request rejects with that error and no modal opens.
   */
  prefill?: (...args: Args) => ReverificationPrefill | undefined;
};

/**
 * Options for a fetcher that takes the reverification result as its first argument.
 *
 * @interface
 */
export type UseReverificationWithResultOptions<Args extends any[] = any[]> = UseReverificationOptions<Args> & {
  /**
   * When `true`, the fetcher's first argument is a `ReverificationResult` (`undefined` on the first call), and the
   * returned function takes the remaining arguments.
   */
  passReverificationResult: true;
};

/**
 * @interface
 */
type UseReverificationResult<
  Fetcher extends (...args: any[]) => Promise<any> | undefined,
  Args extends any[] = Parameters<Fetcher>,
> = (...args: Args) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>>>;

/**
 * Keep the general overload last: `typeof useReverification<Fetcher>` and `Parameters<typeof useReverification>`
 * resolve to it.
 *
 * @interface
 */
type UseReverification = {
  <Args extends any[], Return extends Promise<any> | undefined>(
    /**
     * A function that returns a promise. Its first argument is the reverification result.
     */
    fetcher: (reverification: ReverificationResult | undefined, ...args: Args) => Return,
    /**
     * Configuration object extending [`UseReverificationOptions`](https://clerk.com/docs/reference/hooks/use-reverification#usereverificationoptions).
     */
    options: UseReverificationWithResultOptions<Args>,
  ): (...args: Args) => Promise<ExcludeClerkError<Awaited<Return>>>;
  <Fetcher extends (...args: any[]) => Promise<any> | undefined>(
    /**
     * A function that returns a promise.
     */
    fetcher: Fetcher,
    /**
     * Optional configuration object extending [`UseReverificationOptions`](https://clerk.com/docs/reference/hooks/use-reverification#usereverificationoptions).
     */
    options?: UseReverificationOptions<Parameters<Fetcher>> & { passReverificationResult?: undefined },
  ): UseReverificationResult<Fetcher>;
};

type CreateReverificationHandlerParams = UseReverificationOptions & {
  passReverificationResult?: boolean;
  openUIComponent: Clerk['__internal_openReverification'];
  telemetry: Clerk['telemetry'];
};

/**
 *
 */
function createReverificationHandler(params: CreateReverificationHandlerParams) {
  /**
   *
   */
  function assertReverification<Fetcher extends (...args: any[]) => Promise<any> | undefined>(
    fetcher: Fetcher,
  ): (...args: Parameters<Fetcher>) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>>> {
    const callFetcher = (reverification: ReverificationResult | undefined, args: unknown[]) =>
      params.passReverificationResult ? fetcher(reverification, ...args) : fetcher(...args);

    return (async (...args: Parameters<Fetcher>) => {
      let result = await resolveResult(callFetcher(undefined, args));

      if (isReverificationHint(result)) {
        /**
         * Create a promise
         */
        const resolvers = createDeferredPromise();

        const isValidMetadata = validateReverificationConfig(result.clerk_error.metadata?.reverification);

        const level = isValidMetadata ? isValidMetadata().level : undefined;

        const cancel = () => {
          resolvers.reject(
            new ClerkRuntimeError('User cancelled attempted verification', {
              code: 'reverification_cancelled',
            }),
          );
        };

        const complete = (reverificationResult?: ReverificationResult) => {
          resolvers.resolve(reverificationResult);
        };

        const prefill = params.prefill?.(...args);

        if (params.onNeedsReverification === undefined) {
          /**
           * On success resolve the pending promise
           * On cancel reject the pending promise
           */
          params.openUIComponent?.({
            level: level,
            resetPassword: prefill && {
              password: prefill.newPassword,
              signOutOfOtherSessions: prefill.signOutOfOtherSessions,
            },
            afterVerification: complete,
            afterVerificationCancelled: cancel,
          });
        } else {
          params.onNeedsReverification({
            cancel,
            complete,
            level,
            prefill,
          });
        }

        /**
         * Wait until the promise from above have been resolved or rejected
         */
        const reverificationResult = (await resolvers.promise) as ReverificationResult | undefined;

        /**
         * After the promise resolved successfully try the original request one more time
         */
        result = await resolveResult(callFetcher(reverificationResult, args));
      }

      return result;
    }) as ExcludeClerkError<Awaited<ReturnType<Fetcher>>>;
  }

  return assertReverification;
}

/**
 * > [!WARNING]
 * >
 * > Depending on the SDK you're using, this feature requires `@clerk/nextjs@6.12.7` or later, `@clerk/react@5.25.1` or later, and `@clerk/clerk-js@5.57.1` or later.
 *
 * The `useReverification()` hook is used to handle a session's reverification flow. If a request requires reverification, a modal will display, prompting the user to verify their credentials. Upon successful verification, the original request will automatically retry.
 *
 * @function
 *
 * @returns The `useReverification()` hook returns an array with the "enhanced" fetcher.
 *
 * @example
 * ### Handle cancellation of the reverification process
 *
 * The following example demonstrates how to handle scenarios where a user cancels the reverification flow, such as closing the modal, which might result in `myData` being `null`.
 *
 * In the following example, `myFetcher` would be a function in your backend that fetches data from the route that requires reverification. See the [guide on how to require reverification](https://clerk.com/docs/guides/secure/reverification) for more information.
 *
 * ```tsx {{ filename: 'src/components/MyButton.tsx' }}
 * import { useReverification } from '@clerk/react'
 * import { isReverificationCancelledError } from '@clerk/react/error'
 *
 * type MyData = {
 *   balance: number
 * }
 *
 * export function MyButton() {
 *   const fetchMyData = () => fetch('/api/balance').then(res=> res.json() as Promise<MyData>)
 *   const enhancedFetcher = useReverification(fetchMyData);
 *
 *   const handleClick = async () => {
 *     try {
 *       const myData = await enhancedFetcher()
 *       //     ^ is typed as `MyData`
 *     } catch (err) {
 *       // Handle error returned from the fetcher here
 *
 *       // You can also handle cancellation with the following
 *       if (isReverificationCancelledError(err)) {
 *         // Handle the cancellation error here
 *       }
 *     }
 *   }
 *
 *   return <button onClick={handleClick}>Update User</button>
 * }
 * ```
 *
 * ### Handle a password reset during reverification
 *
 * If reverification reset the password, Clerk already saved the new password. Reload the user instead of sending the
 * original password update again.
 *
 * ```tsx
 * const updatePassword = useReverification(
 *   (reverification: ReverificationResult | undefined, currentUser: UserResource, params: UpdateUserPasswordParams) =>
 *     reverification?.passwordReset ? currentUser.reload() : currentUser.updatePassword(params),
 *   { passReverificationResult: true },
 * );
 *
 * // In the submit handler, once `user` is loaded:
 * await updatePassword(user, { newPassword, signOutOfOtherSessions: true });
 * ```
 */
export const useReverification = ((
  fetcher: (...args: any[]) => Promise<any> | undefined,
  options?: UseReverificationOptions & { passReverificationResult?: true },
) => {
  const { __internal_openReverification, telemetry } = useClerk();
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);

  telemetry?.record(
    eventMethodCalled('useReverification', {
      onNeedsReverification: Boolean(options?.onNeedsReverification),
      passReverificationResult: Boolean(options?.passReverificationResult),
      prefill: Boolean(options?.prefill),
    }),
  );

  // Keep fetcher and options ref in sync
  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = options;
  });

  // The returned function's parameters depend on `passReverificationResult`, which the
  // overloads of `UseReverification` describe.
  return useCallback(
    (...args: unknown[]) => {
      const handler = createReverificationHandler({
        openUIComponent: __internal_openReverification,
        telemetry,
        ...optionsRef.current,
      })(fetcherRef.current);
      return handler(...args);
    },
    [__internal_openReverification, telemetry],
  );
}) as UseReverification;
