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
  // organizationPattern defines the URL pattern that is organization-specific and contains
  // an organization ID or slug as a path token. If a request arrives to the application at
  // a URL matching this path, the organization identifier will be extracted and activated
  // before rendering.
  // If no organization with the given identifier can be activated,
  // either because it does not exist or the user does not have access to it, organization-related
  // fields will be set to null, and the server component must detect this case and respond with
  // an appropriate error (e.g. notFound()).
  // If the route also matches with the personalWorkspacePattern, the personalWorkspacePattern
  // takes precedence.
  //
  // Must have a group named either ":id", which matches to a clerk organization id,
  //                             or ":slug", which matches to a clerk organization slug.
  // Examples: "/orgs/:slug", "/orgs/:id"
  organizationPattern?: Pattern,

  // personalWorkspacePattern defines the URL pattern for resources that exist in the context
  // of a clerk personal workspace (user-specific, outside any other organization).
  // If the route also matches with the organizationPattern, this takes precedence
  personalWorkspacePattern?: Pattern,
}

// Pattern is a URL Pattern API style matcher
// Syntax: https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#pattern_syntax
// Examples: "/orgs/:slug", "/orgs/:id", "/personal-workspace"
type Pattern = string;
