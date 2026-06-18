import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { AllowlistIdentifier } from '../resources/AllowlistIdentifier';
import type { DeletedObject } from '../resources/DeletedObject';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/allowlist_identifiers';

/** @generateWithEmptyComment */
export type AllowlistIdentifierCreateParams = {
  /** The identifier to add to the allowlist. */
  identifier: string;
  /** Whether to notify the user that their identifier has been added to the allowlist. */
  notify: boolean;
};

/** @generateWithEmptyComment */
export class AllowlistIdentifierAPI extends AbstractAPI {
  /**
   * Gets the list of allowlist identifiers for the instance.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`AllowlistIdentifier`](https://clerk.com/docs/reference/backend/types/backend-allowlist-identifier) objects and a `totalCount` property containing the total number of allowlist identifiers for the instance.
   */
  public async getAllowlistIdentifierList(params: ClerkPaginationRequest = {}) {
    return this.request<PaginatedResourceResponse<AllowlistIdentifier[]>>({
      method: 'GET',
      path: basePath,
      queryParams: { ...params, paginated: true },
    });
  }

  /**
   * Creates a new allowlist identifier.
   * @returns The created [`AllowlistIdentifier`](https://clerk.com/docs/reference/backend/types/backend-allowlist-identifier) object.
   */
  public async createAllowlistIdentifier(params: AllowlistIdentifierCreateParams) {
    return this.request<AllowlistIdentifier>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Deletes an allowlist identifier.
   * @param allowlistIdentifierId - The ID of the allowlist identifier to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  public async deleteAllowlistIdentifier(allowlistIdentifierId: string) {
    this.requireId(allowlistIdentifierId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, allowlistIdentifierId),
    });
  }
}
