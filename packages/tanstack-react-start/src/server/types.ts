import type { VerifyTokenOptions } from '@clerk/backend';
import type {
  LegacyRedirectProps,
  MultiDomainAndOrProxy,
  SignInFallbackRedirectUrl,
  SignInForceRedirectUrl,
  SignUpFallbackRedirectUrl,
  SignUpForceRedirectUrl,
} from '@clerk/types';

export type LoaderOptions = {
  publishableKey?: string;
  jwtKey?: string;
  secretKey?: string;
  machineSecretKey?: string;
  signInUrl?: string;
  signUpUrl?: string;
} & Pick<VerifyTokenOptions, 'audience' | 'authorizedParties'> &
  MultiDomainAndOrProxy &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl &
  LegacyRedirectProps;

export type AdditionalStateOptions = SignInFallbackRedirectUrl &
  SignUpFallbackRedirectUrl &
  SignInForceRedirectUrl &
  SignUpForceRedirectUrl;
