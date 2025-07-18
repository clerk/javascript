import type { ClerkPaginationRequest } from '@clerk/types';

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
}
