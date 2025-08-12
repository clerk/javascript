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
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version to avoid breaking changes.
   */
  public async getPlanList(params?: GetOrganizationListParams) {
    return this.request<PaginatedResourceResponse<CommercePlan[]>>({
      method: 'GET',
      path: joinPaths(basePath, 'plans'),
      queryParams: params,
    });
  }
}
