import type { PlatformHttpClient } from '../client';
import type {
  CreateApplicationDomainRequest,
  DeletedObjectResponse,
  DNSCheckResponse,
  DomainResponse,
  DomainStatusResponse,
  ListApplicationDomainsResponse,
  RequestOptions,
  UpdateApplicationDomainRequest,
} from '../types';

/**
 * Domains API
 *
 * Manage domains associated with Clerk applications. In development instances,
 * a domain is provided by Clerk. Production instances require additional
 * configuration to be set up.
 */
export class DomainsAPI {
  constructor(private readonly client: PlatformHttpClient) {}

  /**
   * List all domains for an application's production instance
   *
   * @param applicationId - The application ID
   * @param requestOptions - Additional request options
   * @returns List of domains with total count
   *
   * @example
   * ```ts
   * const { data, total_count } = await platform.domains.list('app_123');
   * console.log(`Found ${total_count} domains`);
   * ```
   */
  async list(applicationId: string, requestOptions?: RequestOptions): Promise<ListApplicationDomainsResponse> {
    return this.client.get<ListApplicationDomainsResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}/domains`,
      undefined,
      requestOptions,
    );
  }

  /**
   * Create a provider domain for an application's production instance
   *
   * @param applicationId - The application ID
   * @param data - Domain data
   * @param requestOptions - Additional request options
   * @returns The created domain
   *
   * @example
   * ```ts
   * const domain = await platform.domains.create('app_123', {
   *   name: 'auth.example.com',
   *   proxy_path: '/__clerk',
   * });
   * ```
   */
  async create(
    applicationId: string,
    data: CreateApplicationDomainRequest,
    requestOptions?: RequestOptions,
  ): Promise<DomainResponse> {
    return this.client.post<DomainResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}/domains`,
      data,
      requestOptions,
    );
  }

  /**
   * Get domain information for an application
   *
   * @param applicationId - The application ID
   * @param domainIdOrName - Domain ID or domain name
   * @param requestOptions - Additional request options
   * @returns The domain
   *
   * @example
   * ```ts
   * const domain = await platform.domains.get('app_123', 'dmn_456');
   * // or by name
   * const domain = await platform.domains.get('app_123', 'auth.example.com');
   * ```
   */
  async get(applicationId: string, domainIdOrName: string, requestOptions?: RequestOptions): Promise<DomainResponse> {
    return this.client.get<DomainResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}/domains/${encodeURIComponent(domainIdOrName)}`,
      undefined,
      requestOptions,
    );
  }

  /**
   * Delete a provider domain from an application's production instance
   *
   * Only provider domains can be deleted. The primary domain cannot be deleted.
   *
   * @param applicationId - The application ID
   * @param domainIdOrName - Domain ID or domain name
   * @param requestOptions - Additional request options
   * @returns Confirmation of deletion
   *
   * @example
   * ```ts
   * const result = await platform.domains.delete('app_123', 'dmn_456');
   * console.log(result.deleted); // true
   * ```
   */
  async delete(
    applicationId: string,
    domainIdOrName: string,
    requestOptions?: RequestOptions,
  ): Promise<DeletedObjectResponse> {
    return this.client.delete<DeletedObjectResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}/domains/${encodeURIComponent(domainIdOrName)}`,
      requestOptions,
    );
  }

  /**
   * Update the production domain for an application
   *
   * @param applicationId - The application ID
   * @param data - Domain data to update
   * @param requestOptions - Additional request options
   * @returns The updated domain
   *
   * @example
   * ```ts
   * const domain = await platform.domains.update('app_123', {
   *   name: 'newauth.example.com',
   * });
   * ```
   */
  async update(
    applicationId: string,
    data: UpdateApplicationDomainRequest,
    requestOptions?: RequestOptions,
  ): Promise<DomainResponse> {
    return this.client.patch<DomainResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}/domain`,
      data,
      requestOptions,
    );
  }

  /**
   * Get the status of a domain for an application
   *
   * Returns DNS, SSL, mail, and proxy status information.
   *
   * @param applicationId - The application ID
   * @param domainIdOrName - Domain ID or domain name
   * @param requestOptions - Additional request options
   * @returns The domain status
   *
   * @example
   * ```ts
   * const status = await platform.domains.getStatus('app_123', 'dmn_456');
   * console.log(status.dns.status); // 'complete', 'in_progress', or 'not_started'
   * ```
   */
  async getStatus(
    applicationId: string,
    domainIdOrName: string,
    requestOptions?: RequestOptions,
  ): Promise<DomainStatusResponse> {
    return this.client.get<DomainStatusResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}/domains/${encodeURIComponent(domainIdOrName)}/status`,
      undefined,
      requestOptions,
    );
  }

  /**
   * Trigger a DNS check for a domain
   *
   * Triggers a DNS check and returns the current domain status.
   * This endpoint ensures that at most one DNS check job is in-flight at any time.
   * If a check is already running or was recently performed, a 409 Conflict is returned.
   *
   * Use this endpoint to trigger a new DNS verification check after configuring DNS records.
   *
   * @param applicationId - The application ID
   * @param domainIdOrName - Domain ID or domain name
   * @param requestOptions - Additional request options
   * @returns The DNS check response with domain status
   *
   * @example
   * ```ts
   * const result = await platform.domains.triggerDNSCheck('app_123', 'dmn_456');
   * console.log(result.dns.status);
   * console.log(result.last_run_at);
   * ```
   */
  async triggerDNSCheck(
    applicationId: string,
    domainIdOrName: string,
    requestOptions?: RequestOptions,
  ): Promise<DNSCheckResponse> {
    return this.client.post<DNSCheckResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}/domains/${encodeURIComponent(domainIdOrName)}/dns_check`,
      undefined,
      requestOptions,
    );
  }
}

/**
 * Create a standalone Domains API instance
 *
 * Useful for tree-shaking when you only need the domains API
 *
 * @param client - The HTTP client instance
 * @returns DomainsAPI instance
 */
export function createDomainsAPI(client: PlatformHttpClient): DomainsAPI {
  return new DomainsAPI(client);
}
