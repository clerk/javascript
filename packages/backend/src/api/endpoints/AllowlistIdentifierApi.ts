import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { AllowlistIdentifier } from '../resources/AllowlistIdentifier';
import type { DeletedObject } from '../resources/DeletedObject';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/allowlist_identifiers';

type AllowlistIdentifierCreateParams = {
  identifier: string;
  notify: boolean;
};

export class AllowlistIdentifierAPI extends AbstractAPI {
  public async getAllowlistIdentifierList(params: ClerkPaginationRequest = {}) {
    return this.request<PaginatedResourceResponse<AllowlistIdentifier[]>>({
      method: 'GET',
      path: basePath,
      queryParams: { ...params, paginated: true },
    });
  }

  public async createAllowlistIdentifier(params: AllowlistIdentifierCreateParams) {
    return this.request<AllowlistIdentifier>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async deleteAllowlistIdentifier(allowlistIdentifierId: string) {
    this.requireId(allowlistIdentifierId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, allowlistIdentifierId),
    });
  }
}
