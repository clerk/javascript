/**
 * @clerk/platform/transfers
 *
 * Tree-shakable sub-module for the Application Transfers API
 *
 * @example
 * ```ts
 * import { PlatformHttpClient } from '@clerk/platform';
 * import { createApplicationTransfersAPI } from '@clerk/platform/transfers';
 *
 * const client = new PlatformHttpClient({ accessToken: 'your_token' });
 * const transfers = createApplicationTransfersAPI(client);
 *
 * const { data, total_count } = await transfers.list({ status: 'pending' });
 * ```
 *
 * @packageDocumentation
 */

export { PlatformHttpClient } from './client';
export { ApplicationTransfersAPI, createApplicationTransfersAPI } from './resources/transfers';
export type {
  ApplicationTransferResponse,
  ApplicationTransferStatus,
  ListApplicationTransfersResponse,
  ListApplicationTransfersParams,
  PlatformClientOptions,
  RequestOptions,
} from './types';
