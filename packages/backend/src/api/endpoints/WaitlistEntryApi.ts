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

type WaitlistEntryInviteParams = {
  ignoreExisting?: boolean;
};

export class WaitlistEntryAPI extends AbstractAPI {
  public async list(params: WaitlistEntryListParams = {}) {
    return this.request<PaginatedResourceResponse<WaitlistEntry>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async create(params: WaitlistEntryCreateParams) {
    return this.request<WaitlistEntry>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async invite(waitlist_entry_id: string, params: WaitlistEntryInviteParams = {}) {
    this.requireId(waitlist_entry_id);

    return this.request<WaitlistEntry>({
      method: 'POST',
      path: joinPaths(basePath, waitlist_entry_id, 'invite'),
      bodyParams: params,
    });
  }

  public async reject(waitlist_entry_id: string) {
    this.requireId(waitlist_entry_id);

    return this.request<WaitlistEntry>({
      method: 'POST',
      path: joinPaths(basePath, waitlist_entry_id, 'reject'),
    });
  }

  public async delete(waitlist_entry_id: string) {
    this.requireId(waitlist_entry_id);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, waitlist_entry_id),
    });
  }
}
