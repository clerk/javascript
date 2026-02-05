import type { ClerkPaginationRequest } from '@clerk/types';
import { joinPaths } from 'src/util/path';

import type { DeletedObject } from '../resources/DeletedObject';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { WaitlistEntryStatus } from '../resources/Enums';
import type { WaitlistEntry } from '../resources/WaitlistEntry';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/waitlist_entries';

type WaitlistEntryListParams = ClerkPaginationRequest<{
  /**
   * Filter waitlist entries by `email_address` or `id`
   */
  query?: string;
  status?: WaitlistEntryStatus;
  orderBy?: WithSign<'created_at' | 'invited_at' | 'email_address'>;
}>;

type WaitlistEntryCreateParams = {
  emailAddress: string;
  notify?: boolean;
};

type WaitlistEntryBulkCreateParams = Array<WaitlistEntryCreateParams>;

type WaitlistEntryInviteParams = {
  /**
   * When true, do not error if an invitation already exists. Default: false.
   */
  ignoreExisting?: boolean;
};

export class WaitlistEntryAPI extends AbstractAPI {
  /**
   * List waitlist entries.
   * @param params Optional parameters (e.g., `query`, `status`, `orderBy`).
   */
  public async list(params: WaitlistEntryListParams = {}) {
    return this.request<PaginatedResourceResponse<WaitlistEntry[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  /**
   * Create a waitlist entry.
   * @param params The parameters for creating a waitlist entry.
   */
  public async create(params: WaitlistEntryCreateParams) {
    return this.request<WaitlistEntry>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Bulk create waitlist entries.
   * @param params An array of parameters for creating waitlist entries.
   */
  public async createBulk(params: WaitlistEntryBulkCreateParams) {
    return this.request<WaitlistEntry[]>({
      method: 'POST',
      path: joinPaths(basePath, 'bulk'),
      bodyParams: params,
    });
  }

  /**
   * Invite a waitlist entry.
   * @param id The waitlist entry ID.
   * @param params Optional parameters (e.g., `ignoreExisting`).
   */
  public async invite(id: string, params: WaitlistEntryInviteParams = {}) {
    this.requireId(id);

    return this.request<WaitlistEntry>({
      method: 'POST',
      path: joinPaths(basePath, id, 'invite'),
      bodyParams: params,
    });
  }

  /**
   * Reject a waitlist entry.
   * @param id The waitlist entry ID.
   */
  public async reject(id: string) {
    this.requireId(id);

    return this.request<WaitlistEntry>({
      method: 'POST',
      path: joinPaths(basePath, id, 'reject'),
    });
  }

  /**
   * Delete a waitlist entry.
   * @param id The waitlist entry ID.
   */
  public async delete(id: string) {
    this.requireId(id);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, id),
    });
  }
}
