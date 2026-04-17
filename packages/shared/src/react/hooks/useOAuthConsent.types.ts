import type { ClerkAPIResponseError } from '../../errors/clerkApiResponseError';
import type { GetOAuthConsentInfoParams, OAuthConsentInfo } from '../../types';

/**
 * Options for {@link useOAuthConsent}.
 *
 * Pass `oauthClientId` and `scope` explicitly. The hook does not read from `window.location` or
 * any other ambient source. The hook is disabled when `oauthClientId` is empty or omitted.
 *
 * @internal
 *
 * @interface
 */
export type UseOAuthConsentParams = Partial<Pick<GetOAuthConsentInfoParams, 'oauthClientId' | 'scope'>> & {
  /**
   * If `true`, the previous data will be kept in the cache until new data is fetched.
   *
   * @default true
   */
  keepPreviousData?: boolean;
  /**
   * If `true`, a request will be triggered when the hook is mounted and the user is signed in.
   *
   * @default true
   */
  enabled?: boolean;
};

/**
 * @internal
 *
 * @interface
 */
export type UseOAuthConsentReturn = {
  /**
   * OAuth consent screen metadata from Clerk, or `undefined` before the first successful fetch.
   * Additional fields (e.g. submission helpers) may be added in the future without renaming this hook.
   */
  data: OAuthConsentInfo | undefined;
  /**
   * Any error that occurred during the data fetch, or `null` if no error occurred.
   */
  error: ClerkAPIResponseError | null;
  /**
   * Whether the initial consent metadata fetch is still in progress.
   */
  isLoading: boolean;
  /**
   * Whether any request is still in flight, including background updates.
   */
  isFetching: boolean;
};
