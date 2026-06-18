import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { BillingPlan } from '../resources/CommercePlan';
import type { BillingSubscription } from '../resources/CommerceSubscription';
import type { BillingSubscriptionItem } from '../resources/CommerceSubscriptionItem';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/billing';
const organizationBasePath = '/organizations';
const userBasePath = '/users';

/** @generateWithEmptyComment */
export type GetPlanListParams = ClerkPaginationRequest<{
  /**
   * Filters plans by the type of payer.
   */
  payerType: 'org' | 'user';
}>;

/** @inline */
export type CancelSubscriptionItemParams = {
  /**
   * Whether the Subscription Item should be canceled immediately. If `false`, the Subscription Item will be canceled at the end of the current billing period.
   */
  endNow?: boolean;
};

/** @inline */
export type ExtendSubscriptionItemFreeTrialParams = {
  /**
   * The date to extend the free trial to. Must be in the future and not more than 365 days from the current trial end date.
   */
  extendTo: Date;
};

/** @generateWithEmptyComment */
export class BillingAPI extends AbstractAPI {
  /**
   * Gets the list of Billing Plans for the instance.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`BillingPlan`](https://clerk.com/docs/reference/backend/types/billing-plan) objects and a `totalCount` property containing the total number of Billing Plans for the instance.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  public async getPlanList(params?: GetPlanListParams) {
    return this.request<PaginatedResourceResponse<BillingPlan[]>>({
      method: 'GET',
      path: joinPaths(basePath, 'plans'),
      queryParams: params,
    });
  }

  /**
   * Cancels the given Subscription Item.
   * @param subscriptionItemId - The ID of the Subscription Item to cancel.
   * @param params - The parameters for the request.
   * @returns The cancelled [`BillingSubscriptionItem`](https://clerk.com/docs/reference/backend/types/billing-subscription-item) object.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  public async cancelSubscriptionItem(subscriptionItemId: string, params?: CancelSubscriptionItemParams) {
    this.requireId(subscriptionItemId);
    return this.request<BillingSubscriptionItem>({
      method: 'DELETE',
      path: joinPaths(basePath, 'subscription_items', subscriptionItemId),
      queryParams: params,
    });
  }

  /**
   * Extends the free trial for the given Subscription Item.
   * @param subscriptionItemId - The ID of the Subscription Item to extend the free trial for.
   * @param params - The parameters for the request.
   * @returns The updated [`BillingSubscriptionItem`](https://clerk.com/docs/reference/backend/types/billing-subscription-item) object.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  public async extendSubscriptionItemFreeTrial(
    subscriptionItemId: string,
    params: ExtendSubscriptionItemFreeTrialParams,
  ) {
    this.requireId(subscriptionItemId);
    return this.request<BillingSubscriptionItem>({
      method: 'POST',
      path: joinPaths('/billing', 'subscription_items', subscriptionItemId, 'extend_free_trial'),
      bodyParams: params,
    });
  }

  /**
   * Gets the [`BillingSubscription`](https://clerk.com/docs/reference/backend/types/billing-subscription) for the given Organization.
   * @param organizationId - The ID of the Organization to get the Billing Subscription for.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  public async getOrganizationBillingSubscription(organizationId: string) {
    this.requireId(organizationId);
    return this.request<BillingSubscription>({
      method: 'GET',
      path: joinPaths(organizationBasePath, organizationId, 'billing', 'subscription'),
    });
  }

  /**
   * Gets the [`BillingSubscription`](https://clerk.com/docs/reference/backend/types/billing-subscription) for the given User.
   * @param userId - The ID of the User to get the Billing Subscription for.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  public async getUserBillingSubscription(userId: string) {
    this.requireId(userId);
    return this.request<BillingSubscription>({
      method: 'GET',
      path: joinPaths(userBasePath, userId, 'billing', 'subscription'),
    });
  }
}
