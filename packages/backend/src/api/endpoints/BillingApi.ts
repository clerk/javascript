import type { ClerkPaginationRequest } from '@clerk/types';

import { joinPaths } from '../../util/path';
import type { CommercePlan } from '../resources/CommercePlan';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/commerce';

type GetOrganizationListParams = ClerkPaginationRequest<{
  payerType: 'org' | 'user';
}>;

export class BillingAPI extends AbstractAPI {
  public async getPlanList(params?: GetOrganizationListParams) {
    return this.request<PaginatedResourceResponse<CommercePlan[]>>({
      method: 'GET',
      path: joinPaths(basePath, 'plans'),
      queryParams: params,
    });
  }
}
