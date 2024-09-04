import type { ApiClient } from '../api';
import type { VerifyTokenOptions } from './verify';

export type AuthenticateRequestOptions = {
  apiClient?: ApiClient;
  publishableKey?: string;
  domain?: string;
  isSatellite?: boolean;
  proxyUrl?: string;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
} & VerifyTokenOptions;
