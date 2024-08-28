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
  // Must have a path component named either ":id" or ":slug".
  // Example: "/orgs/:slug"
  organizationPattern: Pattern,
  personalWorkspacePattern: Pattern,
}

// Pattern is a URL Pattern API style matcher
// Examples: "/orgs/:slug", "/orgs/:id"
type Pattern = string;
