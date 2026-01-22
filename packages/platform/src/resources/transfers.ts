import type { PlatformHttpClient } from '../client';
import type {
  ApplicationTransferResponse,
  ListApplicationTransfersParams,
  ListApplicationTransfersResponse,
  RequestOptions,
} from '../types';

/**
 * Application Transfers API
 *
 * Manage application transfer requests between workspaces. Application transfers
 * allow transferring ownership of an application from one workspace to another.
 */
export class ApplicationTransfersAPI {
  constructor(private readonly client: PlatformHttpClient) {}

  /**
   * List all transfer requests created by the authenticated workspace
   *
   * Returns transfers sorted by creation date in descending order (most recent first).
   *
   * @param params - Query parameters
   * @param params.status - Filter by transfer status (can be single value or array)
   * @param params.limit - Number of results to return per page (1-500, default 10)
   * @param params.starting_after - Cursor for pagination (ID of last transfer from previous page)
   * @param params.ending_before - Cursor for pagination (ID of first transfer from previous page)
   * @param requestOptions - Additional request options
   * @returns List of transfers with total count
   *
   * @example
   * ```ts
   * // List all transfers
   * const { data, total_count } = await platform.transfers.list();
   *
   * // Filter by status
   * const pending = await platform.transfers.list({ status: 'pending' });
   *
   * // Filter by multiple statuses
   * const active = await platform.transfers.list({
   *   status: ['pending', 'completed'],
   *   limit: 50,
   * });
   * ```
   */
  async list(
    params?: ListApplicationTransfersParams,
    requestOptions?: RequestOptions,
  ): Promise<ListApplicationTransfersResponse> {
    const query: Record<string, string | string[] | number | undefined> = {};

    if (params?.status !== undefined) {
      query.status = Array.isArray(params.status) ? params.status : [params.status];
    }
    if (params?.limit !== undefined) {
      query.limit = params.limit;
    }
    if (params?.starting_after !== undefined) {
      query.starting_after = params.starting_after;
    }
    if (params?.ending_before !== undefined) {
      query.ending_before = params.ending_before;
    }

    return this.client.get<ListApplicationTransfersResponse>('/platform/application_transfers', query, requestOptions);
  }

  /**
   * Create a new transfer request for an application
   *
   * Initiates the process of transferring ownership of the application to another workspace.
   * Only one pending transfer can exist for an application at a time.
   * The transfer will expire after 24 hours if not completed.
   *
   * @param applicationId - The application ID
   * @param requestOptions - Additional request options
   * @returns The created transfer
   *
   * @example
   * ```ts
   * const transfer = await platform.transfers.create('app_123');
   * console.log(transfer.code); // Share this code with the recipient
   * console.log(transfer.expires_at);
   * ```
   */
  async create(applicationId: string, requestOptions?: RequestOptions): Promise<ApplicationTransferResponse> {
    return this.client.post<ApplicationTransferResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}/transfers`,
      undefined,
      requestOptions,
    );
  }

  /**
   * Get an application transfer by ID
   *
   * @param applicationId - The application ID
   * @param transferId - The transfer ID
   * @param requestOptions - Additional request options
   * @returns The transfer
   *
   * @example
   * ```ts
   * const transfer = await platform.transfers.get('app_123', 'appxfr_456');
   * console.log(transfer.status);
   * ```
   */
  async get(
    applicationId: string,
    transferId: string,
    requestOptions?: RequestOptions,
  ): Promise<ApplicationTransferResponse> {
    return this.client.get<ApplicationTransferResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}/transfers/${encodeURIComponent(transferId)}`,
      undefined,
      requestOptions,
    );
  }

  /**
   * Cancel an application transfer
   *
   * Only transfers in 'pending' status can be canceled.
   *
   * @param applicationId - The application ID
   * @param transferId - The transfer ID
   * @param requestOptions - Additional request options
   * @returns The canceled transfer
   *
   * @example
   * ```ts
   * const transfer = await platform.transfers.cancel('app_123', 'appxfr_456');
   * console.log(transfer.status); // 'canceled'
   * console.log(transfer.canceled_at);
   * ```
   */
  async cancel(
    applicationId: string,
    transferId: string,
    requestOptions?: RequestOptions,
  ): Promise<ApplicationTransferResponse> {
    return this.client.delete<ApplicationTransferResponse>(
      `/platform/applications/${encodeURIComponent(applicationId)}/transfers/${encodeURIComponent(transferId)}`,
      requestOptions,
    );
  }
}

/**
 * Create a standalone Application Transfers API instance
 *
 * Useful for tree-shaking when you only need the transfers API
 *
 * @param client - The HTTP client instance
 * @returns ApplicationTransfersAPI instance
 */
export function createApplicationTransfersAPI(client: PlatformHttpClient): ApplicationTransfersAPI {
  return new ApplicationTransfersAPI(client);
}
