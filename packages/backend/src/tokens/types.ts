import type { SignedInAuthObjectOptions } from './authObjects';
import type { VerifyTokenOptions } from './verify';

export type RequestStateParams = {
  publishableKey?: string;
  domain?: string;
  isSatellite?: boolean;
  proxyUrl?: string;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
};

export type AuthStatusOptionsType = Partial<SignedInAuthObjectOptions> & RequestStateParams;

export type AuthenticateRequestOptions = RequestStateParams & VerifyTokenOptions;
