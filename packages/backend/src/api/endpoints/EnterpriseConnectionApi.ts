import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { EnterpriseConnection } from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/enterprise_connections';

type EnterpriseConnectionListParams = ClerkPaginationRequest<{
  organizationId?: string;
  active?: boolean;
}>;

export class EnterpriseConnectionAPI extends AbstractAPI {
  public async getEnterpriseConnectionList(params: EnterpriseConnectionListParams = {}) {
    return this.request<PaginatedResourceResponse<EnterpriseConnection[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async getEnterpriseConnection(enterpriseConnectionId: string) {
    this.requireId(enterpriseConnectionId);
    return this.request<EnterpriseConnection>({
      method: 'GET',
      path: joinPaths(basePath, enterpriseConnectionId),
    });
  }
}
