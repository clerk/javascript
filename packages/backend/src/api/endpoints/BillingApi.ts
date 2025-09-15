import type { ClerkPaginationRequest } from '@clerk/types';

import { joinPaths } from '../../util/path';
import type { CommercePlan } from '../resources/CommercePlan';
import type { CommerceSubscription } from '../resources/CommerceSubscription';
import type { CommerceSubscriptionItem } from '../resources/CommerceSubscriptionItem';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/commerce';
const organizationBasePath = '/organizations';
const userBasePath = '/users';

type GetOrganizationListParams = ClerkPaginationRequest<{
  payerType: 'org' | 'user';
}>;

type CancelSubscriptionItemParams = {
  /**
   * If true, the subscription item will be canceled immediately. If false or undefined, the subscription item will be canceled at the end of the current billing period.
   * @default undefined
   */
  endNow?: boolean;
};

export class BillingAPI extends AbstractAPI {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  public async getPlanList(params?: GetOrganizationListParams) {
    return this.request<PaginatedResourceResponse<CommercePlan[]>>({
      method: 'GET',
      path: joinPaths(basePath, 'plans'),
      queryParams: params,
    });
  }

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  public async cancelSubscriptionItem(subscriptionItemId: string, params?: CancelSubscriptionItemParams) {
    this.requireId(subscriptionItemId);
    return this.request<CommerceSubscriptionItem>({
      method: 'DELETE',
      path: joinPaths(basePath, 'subscription_items', subscriptionItemId),
      queryParams: params,
    });
  }

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  public async getOrganizationBillingSubscription(organizationId: string) {
    this.requireId(organizationId);
    return this.request<CommerceSubscription>({
      method: 'GET',
      path: joinPaths(organizationBasePath, organizationId, 'billing', 'subscription'),
    });
  }

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  public async getUserBillingSubscription(userId: string) {
    this.requireId(userId);
    return this.request<CommerceSubscription>({
      method: 'GET',
      path: joinPaths(userBasePath, userId, 'billing', 'subscription'),
    });
  }
}
