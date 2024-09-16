import type { ApiClient } from '../api';
import type { VerifyTokenOptions } from './verify';

export type AuthenticateRequestOptions = {
  publishableKey?: string;
  domain?: string;
  isSatellite?: boolean;
  proxyUrl?: string;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  apiClient?: ApiClient;
} & VerifyTokenOptions;
