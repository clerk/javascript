import type { VerifyTokenOptions } from '@clerk/backend';
import type { OrganizationSyncOptions } from '@clerk/backend/internal';
import type {
  MultiDomainAndOrProxy,
  SignInFallbackRedirectUrl,
  SignInForceRedirectUrl,
  SignUpFallbackRedirectUrl,
  SignUpForceRedirectUrl,
} from '@clerk/shared/types';

export type ClerkMiddlewareOptions = {
  publishableKey?: string;
  jwtKey?: string;
  secretKey?: string;
  machineSecretKey?: string;
  signInUrl?: string;
  signUpUrl?: string;
  organizationSyncOptions?: OrganizationSyncOptions;
  /**
   * Controls whether satellite apps automatically sync with the primary domain on initial page load.
   *
   * When `true` (default), satellite apps will automatically trigger a handshake redirect
   * to sync authentication state with the primary domain, even if no session cookies exist.
   *
   * When `false`, satellite apps will skip the automatic handshake if no session cookies exist,
   * and only trigger the handshake after an explicit sign-in action (when the `__clerk_sync=1`
   * query parameter is present). This optimizes performance for satellite apps where users
   * may not be authenticated, avoiding unnecessary redirects to the primary domain.
   *
   * Can be a boolean or a callback that receives the request URL and returns a boolean.
   *
   * @default true
   */
  satelliteAutoSync?: boolean | ((url: URL) => boolean);
} & Pick<VerifyTokenOptions, 'audience' | 'authorizedParties'> &
  MultiDomainAndOrProxy &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl;

export type LoaderOptions = ClerkMiddlewareOptions;

export type AdditionalStateOptions = SignInFallbackRedirectUrl &
  SignUpFallbackRedirectUrl &
  SignInForceRedirectUrl &
  SignUpForceRedirectUrl;
