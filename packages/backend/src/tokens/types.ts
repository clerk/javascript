import type { VerifyTokenOptions } from './verify';

type RequestStateParams = {
  publishableKey?: string;
  domain?: string;
  isSatellite?: boolean;
  proxyUrl?: string;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
};

export type AuthenticateRequestOptions = RequestStateParams & VerifyTokenOptions;
