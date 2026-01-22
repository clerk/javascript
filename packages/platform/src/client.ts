import { createErrorFromResponse, TimeoutError } from './errors';
import type { PlatformClientOptions, RequestOptions } from './types';

const DEFAULT_BASE_URL = 'https://api.clerk.com/v1';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * HTTP methods supported by the API client
 */
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/**
 * Internal request configuration
 */
interface RequestConfig {
  method: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | string[] | number | boolean | undefined>;
  options?: RequestOptions;
}

/**
 * Core HTTP client for the Clerk Platform API
 *
 * This is the base client that handles HTTP requests, authentication,
 * and error handling. It's designed to be zero-dependency and use
 * the native fetch API.
 */
export class PlatformHttpClient {
  private readonly accessToken: string;
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;
  private readonly timeout: number;

  constructor(options: PlatformClientOptions) {
    if (!options.accessToken) {
      throw new Error('accessToken is required');
    }

    this.accessToken = options.accessToken;
    this.baseUrl = options.baseUrl?.replace(/\/$/, '') ?? DEFAULT_BASE_URL;
    this.fetchFn = options.fetch ?? globalThis.fetch;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;

    if (!this.fetchFn) {
      throw new Error('fetch is not available. Please provide a fetch implementation via the `fetch` option.');
    }
  }

  /**
   * Build a URL with query parameters
   */
  private buildUrl(path: string, query?: Record<string, string | string[] | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined) {
          continue;
        }

        if (Array.isArray(value)) {
          // Handle array parameters (e.g., status[]=pending&status[]=completed)
          for (const item of value) {
            url.searchParams.append(key, item);
          }
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Create an AbortController with timeout
   */
  private createTimeoutController(
    timeout: number,
    existingSignal?: AbortSignal,
  ): { controller: AbortController; timeoutId: ReturnType<typeof setTimeout> | null } {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Set up timeout
    timeoutId = setTimeout(() => {
      controller.abort(new TimeoutError(timeout));
    }, timeout);

    // If there's an existing signal, abort when it aborts
    if (existingSignal) {
      if (existingSignal.aborted) {
        controller.abort(existingSignal.reason);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      } else {
        existingSignal.addEventListener('abort', () => {
          controller.abort(existingSignal.reason);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        });
      }
    }

    return { controller, timeoutId };
  }

  /**
   * Execute an HTTP request
   */
  async request<T>(config: RequestConfig): Promise<T> {
    const { method, path, body, query, options } = config;
    const url = this.buildUrl(path, query);
    const timeout = options?.timeout ?? this.timeout;

    const { controller, timeoutId } = this.createTimeoutController(timeout, options?.signal);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await this.fetchFn(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        throw await createErrorFromResponse(response);
      }

      // Handle empty responses (e.g., 204 No Content)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return undefined as T;
      }

      const text = await response.text();
      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Re-throw timeout errors
      if (error instanceof TimeoutError) {
        throw error;
      }

      // Handle abort errors that might contain our timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        const cause = (error as Error & { cause?: unknown }).cause;
        if (cause instanceof TimeoutError) {
          throw cause;
        }
        // Check if the abort reason is a TimeoutError
        if (controller.signal.reason instanceof TimeoutError) {
          throw controller.signal.reason;
        }
      }

      throw error;
    }
  }

  /**
   * Execute a GET request
   */
  get<T>(
    path: string,
    query?: Record<string, string | string[] | number | boolean | undefined>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>({ method: 'GET', path, query, options });
  }

  /**
   * Execute a POST request
   */
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: 'POST', path, body, options });
  }

  /**
   * Execute a PATCH request
   */
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body, options });
  }

  /**
   * Execute a DELETE request
   */
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, options });
  }
}
