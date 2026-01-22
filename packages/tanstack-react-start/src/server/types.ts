import type { VerifyTokenOptions } from '@clerk/backend';
import type { OrganizationSyncOptions } from '@clerk/backend/internal';
import type {
  MultiDomainAndOrProxyPrimitives,
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
   * When `false` (default), satellite apps will skip the automatic handshake if no session cookies exist,
   * and only trigger the handshake after an explicit sign-in action. This provides the best performance
   * by showing the satellite app immediately without attempting to sync state first.
   *
   * When `true`, satellite apps will automatically trigger a handshake redirect to sync authentication
   * state with the primary domain on first load, even if no session cookies exist. Use this if you want
   * users who are already signed in on the primary domain to be automatically recognized on the satellite.
   *
   * @default false
   */
  satelliteAutoSync?: boolean;
} & Pick<VerifyTokenOptions, 'audience' | 'authorizedParties'> &
  MultiDomainAndOrProxyPrimitives &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl;

export type LoaderOptions = ClerkMiddlewareOptions;

/**
 * Callback function that receives request context and returns middleware options.
 * Allows dynamic configuration based on the current request.
 */
export type ClerkMiddlewareOptionsCallback = (args: {
  url: URL;
}) => ClerkMiddlewareOptions | Promise<ClerkMiddlewareOptions>;

export type AdditionalStateOptions = SignInFallbackRedirectUrl &
  SignUpFallbackRedirectUrl &
  SignInForceRedirectUrl &
  SignUpForceRedirectUrl;
