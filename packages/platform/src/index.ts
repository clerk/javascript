/**
 * @clerk/platform
 *
 * A lightweight, zero-dependency JavaScript/TypeScript client for the Clerk Platform API.
 *
 * @example Basic usage
 * ```ts
 * import { createPlatformClient } from '@clerk/platform';
 *
 * const platform = createPlatformClient({
 *   accessToken: 'your_platform_api_access_token',
 * });
 *
 * // List all applications
 * const applications = await platform.applications.list();
 *
 * // Create a new application
 * const app = await platform.applications.create({
 *   name: 'My New App',
 *   environment_types: ['development', 'production'],
 * });
 *
 * // Get application details
 * const appDetails = await platform.applications.get(app.application_id);
 * ```
 *
 * @example Tree-shaking (using specific sub-modules)
 * ```ts
 * import { PlatformHttpClient } from '@clerk/platform';
 * import { createApplicationsAPI } from '@clerk/platform/applications';
 *
 * const client = new PlatformHttpClient({ accessToken: 'your_token' });
 * const applications = createApplicationsAPI(client);
 *
 * const apps = await applications.list();
 * ```
 *
 * @packageDocumentation
 */

import { PlatformHttpClient } from './client';
import { ApplicationsAPI } from './resources/applications';
import { DomainsAPI } from './resources/domains';
import { ApplicationTransfersAPI } from './resources/transfers';
import type { PlatformClientOptions } from './types';

// Re-export types
export type {
  // Client types
  PlatformClientOptions,
  RequestOptions,
  // Application types
  ApplicationInstance,
  ApplicationResponse,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  DeletedObjectResponse,
  EnvironmentType,
  // Domain types
  DomainResponse,
  CreateApplicationDomainRequest,
  UpdateApplicationDomainRequest,
  ListApplicationDomainsResponse,
  DomainStatusResponse,
  DNSCheckResponse,
  DNSStatus,
  DNSStatusType,
  SSLStatus,
  SSLStatusType,
  DomainStatusType,
  CNAMETarget,
  CNAMEStatus,
  FailureHint,
  MailStatus,
  ProxyStatus,
  // Transfer types
  ApplicationTransferResponse,
  ApplicationTransferStatus,
  ListApplicationTransfersResponse,
  ListApplicationTransfersParams,
  // Error types
  ClerkError,
  ClerkErrorsResponse,
} from './types';

// Re-export errors
export {
  ClerkPlatformError,
  BadRequestError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  TimeoutError,
} from './errors';

// Re-export client
export { PlatformHttpClient } from './client';

// Re-export resource APIs for direct use
export { ApplicationsAPI, createApplicationsAPI } from './resources/applications';
export { DomainsAPI, createDomainsAPI } from './resources/domains';
export { ApplicationTransfersAPI, createApplicationTransfersAPI } from './resources/transfers';

/**
 * The main Clerk Platform API client
 *
 * Provides access to all Platform API resources including applications,
 * domains, and application transfers.
 */
export interface PlatformClient {
  /**
   * Applications API
   *
   * Manage Clerk applications within your workspace.
   */
  applications: ApplicationsAPI;

  /**
   * Domains API
   *
   * Manage domains associated with Clerk applications.
   */
  domains: DomainsAPI;

  /**
   * Application Transfers API
   *
   * Manage application transfer requests between workspaces.
   */
  transfers: ApplicationTransfersAPI;
}

/**
 * Create a new Clerk Platform API client
 *
 * @param options - Client configuration options
 * @param options.accessToken - The Platform API access token (Bearer token)
 * @param options.baseUrl - Base URL for the API (defaults to https://api.clerk.com/v1)
 * @param options.fetch - Custom fetch implementation (defaults to global fetch)
 * @param options.timeout - Request timeout in milliseconds (defaults to 30000)
 * @returns A configured Platform API client
 *
 * @example
 * ```ts
 * import { createPlatformClient } from '@clerk/platform';
 *
 * const platform = createPlatformClient({
 *   accessToken: process.env.CLERK_PLATFORM_API_TOKEN,
 * });
 *
 * // List applications
 * const apps = await platform.applications.list();
 *
 * // Create an application
 * const newApp = await platform.applications.create({
 *   name: 'My App',
 *   environment_types: ['development', 'production'],
 * });
 *
 * // List domains
 * const domains = await platform.domains.list(newApp.application_id);
 *
 * // Create a transfer
 * const transfer = await platform.transfers.create(newApp.application_id);
 * ```
 */
export function createPlatformClient(options: PlatformClientOptions): PlatformClient {
  const httpClient = new PlatformHttpClient(options);

  return {
    applications: new ApplicationsAPI(httpClient),
    domains: new DomainsAPI(httpClient),
    transfers: new ApplicationTransfersAPI(httpClient),
  };
}

// Default export
export default createPlatformClient;
