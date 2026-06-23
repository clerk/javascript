import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { DeletedObject } from '../resources/DeletedObject';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { WaitlistEntryStatus } from '../resources/Enums';
import type { WaitlistEntry } from '../resources/WaitlistEntry';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/waitlist_entries';

/** @generateWithEmptyComment */
export type WaitlistEntryListParams = ClerkPaginationRequest<{
  /** Filters waitlist entries by `email_address` or `id`. */
  query?: string;
  /** Filters waitlist entries by status. */
  status?: WaitlistEntryStatus;
  /** Filters waitlist entries in a particular order. Prefix a value with `+` to sort in ascending order, or `-` to sort in descending order. Defaults to `-created_at`. */
  orderBy?: WithSign<'created_at' | 'invited_at' | 'email_address'>;
}>;

/** @generateWithEmptyComment */
export type WaitlistEntryCreateParams = {
  /** The email address to add to the waitlist. */
  emailAddress: string;
  /** Whether to notify the user that their identifier has been added to the allowlist. Notifies the user if the `identifier` is an email address or phone number. Defaults to `true`. */
  notify?: boolean;
};

/** @generateWithEmptyComment */
export type WaitlistEntryBulkCreateParams = Array<WaitlistEntryCreateParams>;

/** @inline */
export type WaitlistEntryInviteParams = {
  /** Whether to ignore an existing invitation. Defaults to `false`. */
  ignoreExisting?: boolean;
};

/** @generateWithEmptyComment */
export class WaitlistEntryAPI extends AbstractAPI {
  /**
   * Gets a list of waitlist entries for the instance. The list is returned in descending order by creation date, by default.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`WaitlistEntry`](https://clerk.com/docs/reference/backend/types/backend-waitlist-entry) objects and a `totalCount` property containing the total number of waitlist entries for the instance.
   */
  public async list(params: WaitlistEntryListParams = {}) {
    return this.request<PaginatedResourceResponse<WaitlistEntry[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  /**
   * Create a waitlist entry for the given email address. If the email address is already on the waitlist, no new entry will be created and the existing waitlist entry will be returned.
   * @returns The created or existing [`WaitlistEntry`](https://clerk.com/docs/reference/backend/types/backend-waitlist-entry) object.
   */
  public async create(params: WaitlistEntryCreateParams) {
    return this.request<WaitlistEntry>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Creates multiple waitlist entries for the given email addresses. If an email address is already on the waitlist, no new entry will be created and the existing waitlist entry will be returned.
   * @returns An array of created or existing [`WaitlistEntry`](https://clerk.com/docs/reference/backend/types/backend-waitlist-entry) objects.
   */
  public async createBulk(params: WaitlistEntryBulkCreateParams) {
    return this.request<WaitlistEntry[]>({
      method: 'POST',
      path: joinPaths(basePath, 'bulk'),
      bodyParams: params,
    });
  }

  /**
   * Invites the given waitlist entry.
   * @param id - The waitlist entry ID.
   * @param params - Optional parameters for inviting the waitlist entry.
   * @returns The invited [`WaitlistEntry`](https://clerk.com/docs/reference/backend/types/backend-waitlist-entry) object.
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
   * Rejects the given waitlist entry.
   * @param id - The ID of the waitlist entry to reject.
   * @returns The rejected [`WaitlistEntry`](https://clerk.com/docs/reference/backend/types/backend-waitlist-entry) object.
   */
  public async reject(id: string) {
    this.requireId(id);

    return this.request<WaitlistEntry>({
      method: 'POST',
      path: joinPaths(basePath, id, 'reject'),
    });
  }

  /**
   * Deletes the given pending waitlist entry.
   * @param id - The ID of the waitlist entry to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  public async delete(id: string) {
    this.requireId(id);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, id),
    });
  }
}
