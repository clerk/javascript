import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { BlocklistIdentifier } from '../resources/BlocklistIdentifier';
import type { DeletedObject } from '../resources/DeletedObject';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/blocklist_identifiers';

type BlocklistIdentifierCreateParams = {
  identifier: string;
};

export class BlocklistIdentifierAPI extends AbstractAPI {
  public async getBlocklistIdentifierList(params: ClerkPaginationRequest = {}) {
    return this.request<PaginatedResourceResponse<BlocklistIdentifier[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async createBlocklistIdentifier(params: BlocklistIdentifierCreateParams) {
    return this.request<BlocklistIdentifier>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async deleteBlocklistIdentifier(blocklistIdentifierId: string) {
    this.requireId(blocklistIdentifierId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, blocklistIdentifierId),
    });
  }
}
