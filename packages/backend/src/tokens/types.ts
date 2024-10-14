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
  organizationSyncOptions?: OrganizationSyncOptions;
  apiClient?: ApiClient;
} & VerifyTokenOptions;

/**
 * Defines the options for syncing an organization or personal account state from the URL to the clerk session.
 * Useful if the application requires the inclusion of a URL that indicates that a given clerk organization
 * (or personal account) must be active on the clerk session.
 *
 * If a mismatch between the active organization on the session and the organization as indicated by the URL is
 * detected, an attempt to activate the given organization will be made.
 *
 * WARNING: If the activation cannot be performed, either because an organization does not exist or the user lacks
 * access, then the active organization on the session will not be changed (and a warning will be logged). It is
 * ultimately the responsibility of the page to verify that the resources are appropriate to render given the URL,
 * and handle mismatches appropriately (e.g. by returning a 404).
 */
export type OrganizationSyncOptions = {
  /**
   * URL patterns that are organization-specific and contain an organization ID or slug as a path token.
   * If a request matches this path, the organization identifier will be extracted and activated before rendering.
   *
   * WARNING: If the organization cannot be activated either because it does not exist or the user lacks access,
   * organization-related fields will be set to null. The server component must detect this and respond
   * with an appropriate error (e.g., notFound()).
   *
   * If the route also matches the personalAccountPatterns, the personalAccountPattern takes precedence.
   *
   * Must have a path token named either ":id" (matches a clerk organization ID) or ":slug" (matches a clerk
   * organization slug).
   *
   * Common examples:
   * - ["/orgs/:slug", "/orgs/:slug/(.*)"]
   * - ["/orgs/:id", "/orgs/:id/(.*)"]
   * - ["/app/:any/orgs/:slug", "/app/:any/orgs/:slug/(.*)"]
   */
  organizationPatterns?: Pattern[];

  /**
   * URL patterns for resources in the context of a clerk personal account (user-specific, outside any organization).
   * If the route also matches the organizationPattern, this takes precedence.
   *
   * Common examples:
   * - ["/user", "/user/(.*)"]
   * - ["/user/:any", "/user/:any/(.*)"]
   */
  personalAccountPatterns?: Pattern[];
};

/**
 * A pattern representing the structure of a URL path.
 * In addition to a valid URL, may include:
 * - Named path tokens prefixed with a colon (e.g., ":id", ":slug", ":any")
 * - Wildcard token (e.g., ".(*)"), which will match the remainder of the path
 * Examples: "/orgs/:slug", "/app/:any/orgs/:id", "/personal-account/(.*)"
 */
type Pattern = string;
