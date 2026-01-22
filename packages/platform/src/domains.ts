/**
 * @clerk/platform/domains
 *
 * Tree-shakable sub-module for the Domains API
 *
 * @example
 * ```ts
 * import { PlatformHttpClient } from '@clerk/platform';
 * import { createDomainsAPI } from '@clerk/platform/domains';
 *
 * const client = new PlatformHttpClient({ accessToken: 'your_token' });
 * const domains = createDomainsAPI(client);
 *
 * const { data, total_count } = await domains.list('app_123');
 * ```
 *
 * @packageDocumentation
 */

export { PlatformHttpClient } from './client';
export { DomainsAPI, createDomainsAPI } from './resources/domains';
export type {
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
  DeletedObjectResponse,
  PlatformClientOptions,
  RequestOptions,
} from './types';
