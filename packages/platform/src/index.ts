export const DEFAULT_PLATFORM_API_URL = 'https://api.clerk.com/v1';

export type PlatformApplicationEnvironmentType = 'development' | 'production';

export interface PlatformApplicationInstance {
  instance_id: string;
  environment_type: PlatformApplicationEnvironmentType;
  secret_key?: string;
  publishable_key: string;
}

export interface PlatformApplicationResponse {
  application_id: string;
  instances: PlatformApplicationInstance[];
}

export type PlatformListApplicationsResponse = PlatformApplicationResponse[];

export interface ClerkError {
  message: string;
  long_message: string;
  code: string;
  meta?: Record<string, unknown>;
}

export interface ClerkErrors {
  errors: ClerkError[];
  meta?: Record<string, unknown>;
  clerk_trace_id?: string;
}

export interface PlatformCreateApplicationRequest {
  name: string;
  domain?: string;
  proxy_path?: string;
  environment_types?: PlatformApplicationEnvironmentType[];
  template?: string;
}

export interface PlatformDeletedObjectResponse {
  deleted: boolean;
  object: string;
  id: string;
}

export interface PlatformUpdateApplicationRequest {
  name?: string;
}

export interface PlatformUpdateApplicationDomainRequest {
  name: string;
  proxy_path?: string;
}

export interface PlatformDomainCnameTarget {
  name?: string;
  value?: string;
  required?: boolean;
}

export interface PlatformDomainResponse {
  object: 'domain';
  id: string;
  name: string;
  is_satellite?: boolean;
  is_provider_domain?: boolean;
  frontend_api_url: string;
  development_origin: string;
  accounts_portal_url: string;
  proxy_url?: string;
  cname_targets: PlatformDomainCnameTarget[];
}

export interface PlatformListApplicationDomainsResponse {
  data: PlatformDomainResponse[];
  total_count: number;
}

export interface PlatformCreateApplicationDomainRequest {
  name: string;
  proxy_path?: string;
}

export interface FailureHint {
  code: string;
  message: string;
}

export interface CNAMEStatus {
  clerk_subdomain: string;
  from: string;
  to: string;
  verified: boolean;
  required: boolean;
  failure_hints: FailureHint[] | null;
}

export interface PlatformDomainCnameStatuses {
  accounts?: CNAMEStatus;
  clerk?: CNAMEStatus;
  'clk._domainkey'?: CNAMEStatus;
  'clk2._domainkey'?: CNAMEStatus;
  clkmail?: CNAMEStatus;
}

export interface DNSStatus {
  status: 'not_started' | 'in_progress' | 'complete';
  cnames: PlatformDomainCnameStatuses;
}

export interface SSLStatus {
  status: string;
  required: boolean;
  failure_hints: FailureHint[] | null;
}

export interface PlatformSslSummary {
  status: 'complete' | 'in_process' | 'not_started' | 'failed' | 'incomplete';
  required?: boolean;
  failure_hints?: FailureHint[] | null;
}

export interface PlatformMailStatus {
  status: string;
  required: boolean;
}

export interface PlatformProxyStatus {
  status: string;
  required: boolean;
}

export interface PlatformDomainStatusResponse {
  dns: DNSStatus;
  ssl: PlatformSslSummary;
  ssl_hosts?: Record<string, SSLStatus>;
  mail?: PlatformMailStatus;
  proxy?: PlatformProxyStatus;
  status: 'complete' | 'incomplete';
}

export interface PlatformDNSCheckResponse extends PlatformDomainStatusResponse {
  domain_id: string;
  last_run_at: number | null;
}

export type PlatformApplicationTransferStatus = 'pending' | 'completed' | 'canceled' | 'expired';

export interface PlatformApplicationTransferResponse {
  object: 'application_transfer';
  id: string;
  code: string;
  application_id: string;
  status: PlatformApplicationTransferStatus;
  expires_at: string;
  created_at: string;
  canceled_at: string | null;
  completed_at: string | null;
}

export interface PlatformListApplicationTransfersResponse {
  data: PlatformApplicationTransferResponse[];
  total_count: number;
}

export type PlatformApiTokenProvider = string | (() => string);

export type PlatformFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface PlatformClientOptions {
  apiToken: PlatformApiTokenProvider;
  baseUrl?: string;
  fetch?: PlatformFetch;
  headers?: HeadersInit;
  userAgent?: string;
}

export interface PlatformRequestOptions {
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export interface PlatformListApplicationsParams {
  include_secret_keys?: boolean;
}

export interface PlatformGetApplicationParams {
  include_secret_keys?: boolean;
}

export interface PlatformListApplicationTransfersParams {
  status?: PlatformApplicationTransferStatus[];
  limit?: number;
  starting_after?: string;
  ending_before?: string;
}

export interface PlatformClient {
  listApplications(
    params?: PlatformListApplicationsParams,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformListApplicationsResponse>;
  createApplication(
    body: PlatformCreateApplicationRequest,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformApplicationResponse>;
  getApplication(
    applicationID: string,
    params?: PlatformGetApplicationParams,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformApplicationResponse>;
  updateApplication(
    applicationID: string,
    body: PlatformUpdateApplicationRequest,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformApplicationResponse>;
  deleteApplication(applicationID: string, requestOptions?: PlatformRequestOptions): Promise<PlatformDeletedObjectResponse>;
  updateApplicationDomain(
    applicationID: string,
    body: PlatformUpdateApplicationDomainRequest,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformDomainResponse>;
  listApplicationDomains(
    applicationID: string,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformListApplicationDomainsResponse>;
  createApplicationDomain(
    applicationID: string,
    body: PlatformCreateApplicationDomainRequest,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformDomainResponse>;
  getApplicationDomain(
    applicationID: string,
    domainIDOrName: string,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformDomainResponse>;
  deleteApplicationDomain(
    applicationID: string,
    domainIDOrName: string,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformDeletedObjectResponse>;
  getApplicationDomainStatus(
    applicationID: string,
    domainIDOrName: string,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformDomainStatusResponse>;
  triggerDNSCheck(
    applicationID: string,
    domainIDOrName: string,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformDNSCheckResponse>;
  listApplicationTransfers(
    params?: PlatformListApplicationTransfersParams,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformListApplicationTransfersResponse>;
  createApplicationTransfer(
    applicationID: string,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformApplicationTransferResponse>;
  getApplicationTransfer(
    applicationID: string,
    transferID: string,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformApplicationTransferResponse>;
  cancelApplicationTransfer(
    applicationID: string,
    transferID: string,
    requestOptions?: PlatformRequestOptions,
  ): Promise<PlatformApplicationTransferResponse>;
}

export interface PlatformApiErrorOptions {
  status: number;
  errors?: ClerkErrors;
  clerkTraceId?: string;
  rawBody?: string | null;
}

export class PlatformApiError extends Error {
  public readonly status: number;
  public readonly errors?: ClerkErrors;
  public readonly clerkTraceId?: string;
  public readonly rawBody?: string | null;

  public constructor(message: string, options: PlatformApiErrorOptions) {
    super(message);
    this.name = 'PlatformApiError';
    this.status = options.status;
    this.errors = options.errors;
    this.clerkTraceId = options.clerkTraceId;
    this.rawBody = options.rawBody ?? null;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type QueryParamValue =
  | string
  | number
  | boolean
  | readonly string[]
  | readonly number[]
  | readonly boolean[]
  | null
  | undefined;

type QueryParams = Record<string, QueryParamValue>;

interface PlatformRequestConfig {
  method: HttpMethod;
  path: string;
  query?: QueryParams;
  body?: unknown;
  options?: PlatformRequestOptions;
}

interface ParsedBody {
  data: unknown;
  text: string | null;
}

type PlatformRequester = <T>(config: PlatformRequestConfig) => Promise<T>;

export const createPlatformClient = (options: PlatformClientOptions): PlatformClient => {
  const request = createRequester(options);

  return {
    listApplications: (params, requestOptions) =>
      request<PlatformListApplicationsResponse>({
        method: 'GET',
        path: '/platform/applications',
        query: params,
        options: requestOptions,
      }),
    createApplication: (body, requestOptions) =>
      request<PlatformApplicationResponse>({
        method: 'POST',
        path: '/platform/applications',
        body,
        options: requestOptions,
      }),
    getApplication: (applicationID, params, requestOptions) =>
      request<PlatformApplicationResponse>({
        method: 'GET',
        path: `/platform/applications/${encodePathParam(applicationID)}`,
        query: params,
        options: requestOptions,
      }),
    updateApplication: (applicationID, body, requestOptions) =>
      request<PlatformApplicationResponse>({
        method: 'PATCH',
        path: `/platform/applications/${encodePathParam(applicationID)}`,
        body,
        options: requestOptions,
      }),
    deleteApplication: (applicationID, requestOptions) =>
      request<PlatformDeletedObjectResponse>({
        method: 'DELETE',
        path: `/platform/applications/${encodePathParam(applicationID)}`,
        options: requestOptions,
      }),
    updateApplicationDomain: (applicationID, body, requestOptions) =>
      request<PlatformDomainResponse>({
        method: 'PATCH',
        path: `/platform/applications/${encodePathParam(applicationID)}/domain`,
        body,
        options: requestOptions,
      }),
    listApplicationDomains: (applicationID, requestOptions) =>
      request<PlatformListApplicationDomainsResponse>({
        method: 'GET',
        path: `/platform/applications/${encodePathParam(applicationID)}/domains`,
        options: requestOptions,
      }),
    createApplicationDomain: (applicationID, body, requestOptions) =>
      request<PlatformDomainResponse>({
        method: 'POST',
        path: `/platform/applications/${encodePathParam(applicationID)}/domains`,
        body,
        options: requestOptions,
      }),
    getApplicationDomain: (applicationID, domainIDOrName, requestOptions) =>
      request<PlatformDomainResponse>({
        method: 'GET',
        path: `/platform/applications/${encodePathParam(applicationID)}/domains/${encodePathParam(domainIDOrName)}`,
        options: requestOptions,
      }),
    deleteApplicationDomain: (applicationID, domainIDOrName, requestOptions) =>
      request<PlatformDeletedObjectResponse>({
        method: 'DELETE',
        path: `/platform/applications/${encodePathParam(applicationID)}/domains/${encodePathParam(domainIDOrName)}`,
        options: requestOptions,
      }),
    getApplicationDomainStatus: (applicationID, domainIDOrName, requestOptions) =>
      request<PlatformDomainStatusResponse>({
        method: 'GET',
        path: `/platform/applications/${encodePathParam(applicationID)}/domains/${encodePathParam(
          domainIDOrName,
        )}/status`,
        options: requestOptions,
      }),
    triggerDNSCheck: (applicationID, domainIDOrName, requestOptions) =>
      request<PlatformDNSCheckResponse>({
        method: 'POST',
        path: `/platform/applications/${encodePathParam(applicationID)}/domains/${encodePathParam(
          domainIDOrName,
        )}/dns_check`,
        options: requestOptions,
      }),
    listApplicationTransfers: (params, requestOptions) =>
      request<PlatformListApplicationTransfersResponse>({
        method: 'GET',
        path: '/platform/application_transfers',
        query: params,
        options: requestOptions,
      }),
    createApplicationTransfer: (applicationID, requestOptions) =>
      request<PlatformApplicationTransferResponse>({
        method: 'POST',
        path: `/platform/applications/${encodePathParam(applicationID)}/transfers`,
        options: requestOptions,
      }),
    getApplicationTransfer: (applicationID, transferID, requestOptions) =>
      request<PlatformApplicationTransferResponse>({
        method: 'GET',
        path: `/platform/applications/${encodePathParam(applicationID)}/transfers/${encodePathParam(transferID)}`,
        options: requestOptions,
      }),
    cancelApplicationTransfer: (applicationID, transferID, requestOptions) =>
      request<PlatformApplicationTransferResponse>({
        method: 'DELETE',
        path: `/platform/applications/${encodePathParam(applicationID)}/transfers/${encodePathParam(transferID)}`,
        options: requestOptions,
      }),
  };
};

const createRequester = (options: PlatformClientOptions): PlatformRequester => {
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_PLATFORM_API_URL);
  const fetcher = resolveFetch(options.fetch);
  const defaultHeaders = options.headers;
  const userAgent = options.userAgent;

  return async <T>(config: PlatformRequestConfig): Promise<T> => {
    const url = buildUrl(baseUrl, config.path, config.query);
    const headers = mergeHeaders(defaultHeaders, config.options?.headers);
    const token = resolveApiToken(options.apiToken);

    headers.set('authorization', `Bearer ${token}`);
    if (!headers.has('accept')) {
      headers.set('accept', 'application/json');
    }
    if (userAgent && !headers.has('user-agent')) {
      headers.set('user-agent', userAgent);
    }
    if (config.body !== undefined && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    const response = await fetcher(url, {
      method: config.method,
      headers,
      body: config.body === undefined ? undefined : JSON.stringify(config.body),
      signal: config.options?.signal,
    });

    const { data, text } = await readResponseBody(response);

    if (!response.ok) {
      const clerkErrors = isClerkErrors(data) ? data : undefined;
      const message = getErrorMessage(clerkErrors, response.statusText);
      const rawBody = typeof data === 'string' ? data : text;

      throw new PlatformApiError(message, {
        status: response.status,
        errors: clerkErrors,
        clerkTraceId: clerkErrors?.clerk_trace_id,
        rawBody,
      });
    }

    return data as T;
  };
};

const resolveFetch = (providedFetch?: PlatformFetch): PlatformFetch => {
  if (providedFetch) {
    return providedFetch;
  }
  if (typeof fetch === 'function') {
    return fetch.bind(globalThis);
  }
  throw new Error('fetch is not available. Provide a custom fetch implementation.');
};

const resolveApiToken = (provider: PlatformApiTokenProvider): string => {
  const token = typeof provider === 'function' ? provider() : provider;
  if (!token || token.trim().length === 0) {
    throw new Error('Platform API token is required.');
  }
  return token;
};

const normalizeBaseUrl = (baseUrl: string): string => {
  return baseUrl.replace(/\/+$/, '');
};

const buildUrl = (baseUrl: string, path: string, query?: QueryParams): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const queryString = buildQueryString(query);
  if (!queryString) {
    return `${baseUrl}${normalizedPath}`;
  }
  return `${baseUrl}${normalizedPath}?${queryString}`;
};

const buildQueryString = (params?: QueryParams): string => {
  if (!params) {
    return '';
  }
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry === undefined || entry === null) {
          continue;
        }
        searchParams.append(key, String(entry));
      }
      continue;
    }
    searchParams.append(key, String(value));
  }
  return searchParams.toString();
};

const mergeHeaders = (...headerSets: Array<HeadersInit | undefined>): Headers => {
  const headers = new Headers();
  for (const headerSet of headerSets) {
    if (!headerSet) {
      continue;
    }
    const current = new Headers(headerSet);
    current.forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return headers;
};

const encodePathParam = (value: string): string => {
  return encodeURIComponent(value);
};

const readResponseBody = async (response: Response): Promise<ParsedBody> => {
  let text: string | null = null;
  try {
    text = await response.text();
  } catch {
    text = null;
  }
  if (!text) {
    return { data: null, text: null };
  }
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return { data: safeJsonParse(text), text };
  }
  return { data: text, text };
};

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isClerkError = (value: unknown): value is ClerkError => {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.message === 'string' &&
    typeof value.long_message === 'string' &&
    typeof value.code === 'string'
  );
};

const isClerkErrors = (value: unknown): value is ClerkErrors => {
  if (!isRecord(value)) {
    return false;
  }
  const errors = value.errors;
  if (!Array.isArray(errors)) {
    return false;
  }
  return errors.every(isClerkError);
};

const getErrorMessage = (errors: ClerkErrors | undefined, fallback: string): string => {
  const first = errors?.errors[0];
  if (first?.long_message) {
    return first.long_message;
  }
  if (first?.message) {
    return first.message;
  }
  return fallback;
};
