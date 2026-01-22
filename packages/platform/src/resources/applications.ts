import type { PlatformHttpClient } from '../client';
import type {
  ApplicationResponse,
  CreateApplicationRequest,
  DeletedObjectResponse,
  RequestOptions,
  UpdateApplicationRequest,
} from '../types';

/**
 * Applications API
 *
 * Manage Clerk applications within your workspace. Each application can have
 * multiple instances, typically one for development and one for production,
 * each with distinct user pools.
 */
export class ApplicationsAPI {
  constructor(private readonly client: PlatformHttpClient) {}

  /**
   * List all applications in the workspace
   *
   * @param options.includeSecretKeys - Whether to include secret keys in the response
   * @param options.requestOptions - Additional request options
   * @returns Array of applications
   *
   * @example
   * ```ts
   * const applications = await platform.applications.list();
   * console.log(applications);
   * ```
   *
   * @example
   * ```ts
   * // Include secret keys
   * const applications = await platform.applications.list({ includeSecretKeys: true });
   * ```
   */
  async list(
    options?: {
      includeSecretKeys?: boolean;
    } & RequestOptions,
  ): Promise<ApplicationResponse[]> {
    const { includeSecretKeys, ...requestOptions } = options ?? {};

    return this.client.get<ApplicationResponse[]>(
      '/platform/applications',
      { include_secret_keys: includeSecretKeys },
      requestOptions,
    );
  }

  /**
   * Create a new application
   *
   * @param data - Application data
   * @param requestOptions - Additional request options
   * @returns The created application
   *
   * @example
   * ```ts
   * const app = await platform.applications.create({
   *   name: 'My New App',
   *   domain: 'myapp.com',
   *   environment_types: ['development', 'production'],
   * });
   * ```
   */
  async create(data: CreateApplicationRequest, requestOptions?: RequestOptions): Promise<ApplicationResponse> {
    return this.client.post<ApplicationResponse>('/platform/applications', data, requestOptions);
  }

  /**
   * Get an application by ID
   *
   * @param applicationId - The application ID
   * @param options.includeSecretKeys - Whether to include secret keys in the response
   * @param options.requestOptions - Additional request options
   * @returns The application
   *
   * @example
   * ```ts
   * const app = await platform.applications.get('app_123');
   * console.log(app.instances);
   * ```
   */
  async get(
    applicationId: string,
    options?: {
      includeSecretKeys?: boolean;
    } & RequestOptions,
  ): Promise<ApplicationResponse> {
    const { includeSecretKeys, ...requestOptions } = options ?? {};

    return this.client.get<ApplicationResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}`,
      { include_secret_keys: includeSecretKeys },
      requestOptions,
    );
  }

  /**
   * Update an application
   *
   * @param applicationId - The application ID
   * @param data - Application data to update
   * @param requestOptions - Additional request options
   * @returns The updated application
   *
   * @example
   * ```ts
   * const app = await platform.applications.update('app_123', {
   *   name: 'My Updated App',
   * });
   * ```
   */
  async update(
    applicationId: string,
    data: UpdateApplicationRequest,
    requestOptions?: RequestOptions,
  ): Promise<ApplicationResponse> {
    return this.client.patch<ApplicationResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}`,
      data,
      requestOptions,
    );
  }

  /**
   * Delete an application
   *
   * @param applicationId - The application ID
   * @param requestOptions - Additional request options
   * @returns Confirmation of deletion
   *
   * @example
   * ```ts
   * const result = await platform.applications.delete('app_123');
   * console.log(result.deleted); // true
   * ```
   */
  async delete(applicationId: string, requestOptions?: RequestOptions): Promise<DeletedObjectResponse> {
    return this.client.delete<DeletedObjectResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}`,
      requestOptions,
    );
  }
}

/**
 * Create a standalone Applications API instance
 *
 * Useful for tree-shaking when you only need the applications API
 *
 * @param client - The HTTP client instance
 * @returns ApplicationsAPI instance
 */
export function createApplicationsAPI(client: PlatformHttpClient): ApplicationsAPI {
  return new ApplicationsAPI(client);
}
