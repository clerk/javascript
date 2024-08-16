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
  organizationSync?: OrganizationSyncOptions;
} & VerifyTokenOptions;

// OrganizationSyncOptions define the options for syncing an organization
// or personal workspace state from the URL to the clerk session
export type OrganizationSyncOptions = {
  organizationPattern: string,
  personalWorkspacePattern: string,
  invalidOrganizationRedirectURL: string
}
