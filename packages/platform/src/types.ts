/**
 * Clerk Platform API Types
 *
 * These types are generated based on the Clerk Platform API OpenAPI specification.
 * @see https://api.clerk.com/v1
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Environment type for an application instance
 */
export type EnvironmentType = 'development' | 'production';

/**
 * Application transfer status
 */
export type ApplicationTransferStatus = 'pending' | 'completed' | 'canceled' | 'expired';

/**
 * DNS verification status
 */
export type DNSStatusType = 'not_started' | 'in_progress' | 'complete';

/**
 * SSL certificate status
 */
export type SSLStatusType = 'complete' | 'in_process' | 'not_started' | 'failed' | 'incomplete';

/**
 * Domain overall status
 */
export type DomainStatusType = 'complete' | 'incomplete';

// ============================================================================
// Application Types
// ============================================================================

/**
 * Represents an instance (environment) within a Clerk application.
 * Each application can have multiple instances, typically one for development
 * and one for production.
 */
export interface ApplicationInstance {
  /**
   * The unique identifier for this instance.
   * Use this ID when making API calls that target a specific instance.
   */
  instance_id: string;

  /**
   * The environment type of the instance.
   * Determines whether this instance is used for development/testing or production workloads.
   */
  environment_type: EnvironmentType;

  /**
   * The publishable key for this instance.
   * Safe to include in client-side code and used to initialize Clerk SDKs in the browser.
   */
  publishable_key: string;

  /**
   * The secret key for authenticating server-side API requests to this instance.
   * Keep this value secure and never expose it in client-side code.
   * Only included when `include_secret_keys` is true.
   */
  secret_key?: string;
}

/**
 * Response object representing a Clerk application
 */
export interface ApplicationResponse {
  /**
   * The ID of the application
   */
  application_id: string;

  /**
   * List of instances associated with this application
   */
  instances: ApplicationInstance[];
}

/**
 * Request body for creating a new application
 */
export interface CreateApplicationRequest {
  /**
   * The name of the application
   */
  name: string;

  /**
   * The domain for the application (optional)
   */
  domain?: string;

  /**
   * Custom proxy path for provider domains (e.g., "/__clerk").
   * Must start with a leading slash and be a single path segment.
   * Defaults to "/__clerk" if not provided.
   */
  proxy_path?: string;

  /**
   * List of environment types to create instances for
   */
  environment_types?: EnvironmentType[];

  /**
   * Application template to use for configuring the application
   * (e.g., "b2b-saas", "b2c-saas", "waitlist")
   */
  template?: string;
}

/**
 * Request body for updating an application
 */
export interface UpdateApplicationRequest {
  /**
   * The name of the application
   */
  name?: string;
}

/**
 * Response for deleted object operations
 */
export interface DeletedObjectResponse {
  /**
   * Whether the object was deleted
   */
  deleted: boolean;

  /**
   * Object type indicator
   */
  object: 'deleted';

  /**
   * The ID of the deleted resource
   */
  id: string;
}

// ============================================================================
// Domain Types
// ============================================================================

/**
 * CNAME target for domain configuration
 */
export interface CNAMETarget {
  name?: string;
  value?: string;
  required?: boolean;
}

/**
 * Response object representing a domain
 */
export interface DomainResponse {
  /**
   * Object type identifier
   */
  object: 'domain';

  /**
   * The ID of the domain
   */
  id: string;

  /**
   * The domain name
   */
  name: string;

  /**
   * Whether this is a satellite domain
   */
  is_satellite?: boolean;

  /**
   * Whether this is a provider domain
   */
  is_provider_domain?: boolean;

  /**
   * The frontend API URL
   */
  frontend_api_url: string;

  /**
   * The development origin
   */
  development_origin: string;

  /**
   * The accounts portal URL
   */
  accounts_portal_url: string;

  /**
   * The proxy URL
   */
  proxy_url?: string;

  /**
   * CNAME targets for the domain
   */
  cname_targets: CNAMETarget[];
}

/**
 * Request body for updating application domain
 */
export interface UpdateApplicationDomainRequest {
  /**
   * The domain name
   */
  name: string;

  /**
   * Optional proxy path for provider domains
   */
  proxy_path?: string;
}

/**
 * Request body for creating application domain
 */
export interface CreateApplicationDomainRequest {
  /**
   * The provider domain name
   */
  name: string;

  /**
   * Optional proxy path for provider domains
   */
  proxy_path?: string;
}

/**
 * Response for listing application domains
 */
export interface ListApplicationDomainsResponse {
  /**
   * The list of application domains
   */
  data: DomainResponse[];

  /**
   * The total number of application domains for the application
   */
  total_count: number;
}

/**
 * Failure hint for DNS/SSL verification
 */
export interface FailureHint {
  code: string;
  message: string;
}

/**
 * CNAME verification status
 */
export interface CNAMEStatus {
  clerk_subdomain: string;
  from: string;
  to: string;
  verified: boolean;
  required: boolean;
  failure_hints: FailureHint[] | null;
}

/**
 * DNS verification status
 */
export interface DNSStatus {
  status: DNSStatusType;
  cnames: {
    accounts?: CNAMEStatus;
    clerk?: CNAMEStatus;
    'clk._domainkey'?: CNAMEStatus;
    'clk2._domainkey'?: CNAMEStatus;
    clkmail?: CNAMEStatus;
  };
}

/**
 * SSL certificate status
 */
export interface SSLStatus {
  status: string;
  required: boolean;
  failure_hints: FailureHint[] | null;
}

/**
 * Mail status
 */
export interface MailStatus {
  status: string;
  required: boolean;
}

/**
 * Proxy status
 */
export interface ProxyStatus {
  status: string;
  required: boolean;
}

/**
 * Domain status response
 */
export interface DomainStatusResponse {
  dns: DNSStatus;
  ssl: {
    status: SSLStatusType;
    required?: boolean;
    failure_hints?: FailureHint[] | null;
  };
  ssl_hosts?: Record<string, SSLStatus>;
  mail?: MailStatus;
  proxy?: ProxyStatus;
  status: DomainStatusType;
}

/**
 * DNS check response
 */
export interface DNSCheckResponse extends DomainStatusResponse {
  /**
   * The ID of the domain
   */
  domain_id: string;

  /**
   * The timestamp in epoch milliseconds of the last DNS check, if any.
   * Will be null if no check has been performed yet.
   */
  last_run_at: number | null;
}

// ============================================================================
// Application Transfer Types
// ============================================================================

/**
 * Response object representing an application transfer
 */
export interface ApplicationTransferResponse {
  /**
   * The object type
   */
  object: 'application_transfer';

  /**
   * The unique identifier for the application transfer
   */
  id: string;

  /**
   * A unique code for the transfer that can be shared with the recipient
   * to claim the application
   */
  code: string;

  /**
   * The ID of the application being transferred
   */
  application_id: string;

  /**
   * The current status of the transfer
   */
  status: ApplicationTransferStatus;

  /**
   * The timestamp when the transfer expires if not completed (ISO 8601)
   */
  expires_at: string;

  /**
   * The timestamp when the transfer was created (ISO 8601)
   */
  created_at: string;

  /**
   * The timestamp when the transfer was canceled, or null if not canceled (ISO 8601)
   */
  canceled_at: string | null;

  /**
   * The timestamp when the transfer was completed, or null if not completed (ISO 8601)
   */
  completed_at: string | null;
}

/**
 * Response for listing application transfers
 */
export interface ListApplicationTransfersResponse {
  /**
   * The list of application transfers
   */
  data: ApplicationTransferResponse[];

  /**
   * The total number of application transfers matching the query
   */
  total_count: number;
}

/**
 * Parameters for listing application transfers
 */
export interface ListApplicationTransfersParams {
  /**
   * Filter by transfer status
   */
  status?: ApplicationTransferStatus | ApplicationTransferStatus[];

  /**
   * Number of results to return per page (1-500, default 10)
   */
  limit?: number;

  /**
   * Cursor for pagination - ID of the last transfer from the previous page
   */
  starting_after?: string;

  /**
   * Cursor for pagination - ID of the first transfer from the previous page
   */
  ending_before?: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * A single Clerk API error
 */
export interface ClerkError {
  message: string;
  long_message: string;
  code: string;
  meta?: Record<string, unknown>;
}

/**
 * Clerk API error response
 */
export interface ClerkErrorsResponse {
  errors: ClerkError[];
  meta?: Record<string, unknown>;
  clerk_trace_id?: string;
}

// ============================================================================
// Client Configuration Types
// ============================================================================

/**
 * Configuration options for the Platform API client
 */
export interface PlatformClientOptions {
  /**
   * The Platform API access token (Bearer token)
   */
  accessToken: string;

  /**
   * Base URL for the API (defaults to https://api.clerk.com/v1)
   */
  baseUrl?: string;

  /**
   * Custom fetch implementation (defaults to global fetch)
   */
  fetch?: typeof fetch;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Request options for individual API calls
 */
export interface RequestOptions {
  /**
   * AbortSignal for request cancellation
   */
  signal?: AbortSignal;

  /**
   * Request timeout in milliseconds (overrides client default)
   */
  timeout?: number;
}
