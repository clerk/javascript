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
