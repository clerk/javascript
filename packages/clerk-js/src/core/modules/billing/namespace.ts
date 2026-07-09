import type {
  BillingCheckoutJSON,
  BillingCreditBalanceJSON,
  BillingCreditBalanceResource,
  BillingCreditLedgerJSON,
  BillingCreditLedgerResource,
  BillingNamespace,
  BillingPaymentJSON,
  BillingPaymentResource,
  BillingPlanJSON,
  BillingPlanResource,
  BillingStatementJSON,
  BillingStatementResource,
  BillingSubscriptionItemJSON,
  BillingSubscriptionItemResource,
  BillingSubscriptionJSON,
  BillingSubscriptionResource,
  ClerkPaginatedResponse,
  CreateCheckoutParams,
  GetCreditBalanceParams,
  GetCreditHistoryParams,
  GetPaymentAttemptsParams,
  GetPlansParams,
  GetStatementsParams,
  GetSubscriptionParams,
  PreflightStorePurchaseParams,
  RegisterStorePurchaseParams,
} from '@clerk/shared/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import {
  BaseResource,
  BillingCheckout,
  BillingCreditBalance,
  BillingCreditLedger,
  BillingPayment,
  BillingPlan,
  BillingStatement,
  BillingSubscription,
  BillingSubscriptionItem,
} from '../../resources/internal';

export class Billing implements BillingNamespace {
  static readonly #pathRoot = '/billing';
  static path(subPath: string, param?: { orgId?: string | null }): string {
    const { orgId } = param || {};
    const prefix = orgId ? `/organizations/${orgId}` : '/me';
    return `${prefix}${Billing.#pathRoot}${subPath}`;
  }

  getPlans = async (params?: GetPlansParams): Promise<ClerkPaginatedResponse<BillingPlanResource>> => {
    const { for: forParam, orgId, minSeats, ...safeParams } = params || {};
    const searchParams = {
      ...safeParams,
      payer_type: forParam === 'organization' ? 'org' : 'user',
      org_id: orgId,
      min_seats: minSeats,
    };
    return await BaseResource._fetch({
      path: `${Billing.#pathRoot}/plans`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(searchParams),
    }).then(res => {
      const { data: plans, total_count } = res as unknown as ClerkPaginatedResponse<BillingPlanJSON>;

      return {
        total_count,
        data: plans.map(plan => new BillingPlan(plan)),
      };
    });
  };

  // Inconsistent API
  getPlan = async (params: { id: string }): Promise<BillingPlanResource> => {
    const plan = (await BaseResource._fetch({
      path: `${Billing.#pathRoot}/plans/${params.id}`,
      method: 'GET',
    })) as unknown as BillingPlanJSON;
    return new BillingPlan(plan);
  };

  getSubscription = async (params: GetSubscriptionParams): Promise<BillingSubscriptionResource> => {
    return await BaseResource._fetch({
      path: Billing.path(`/subscription`, { orgId: params.orgId }),
      method: 'GET',
    }).then(res => new BillingSubscription(res?.response as BillingSubscriptionJSON));
  };

  getStatements = async (params: GetStatementsParams): Promise<ClerkPaginatedResponse<BillingStatementResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: Billing.path(`/statements`, { orgId }),
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: statements, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<BillingStatementJSON>;

      return {
        total_count,
        data: statements.map(statement => new BillingStatement(statement)),
      };
    });
  };

  getStatement = async (params: { id: string; orgId?: string }): Promise<BillingStatementResource> => {
    const statement = (
      await BaseResource._fetch({
        path: Billing.path(`/statements/${params.id}`, { orgId: params.orgId }),
        method: 'GET',
      })
    )?.response as unknown as BillingStatementJSON;
    return new BillingStatement(statement);
  };

  getPaymentAttempts = async (
    params: GetPaymentAttemptsParams,
  ): Promise<ClerkPaginatedResponse<BillingPaymentResource>> => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: Billing.path(`/payment_attempts`, { orgId }),
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: payments, total_count } = res as unknown as ClerkPaginatedResponse<BillingPaymentJSON>;

      return {
        total_count,
        data: payments.map(payment => new BillingPayment(payment)),
      };
    });
  };

  getPaymentAttempt = async (params: { id: string; orgId?: string }): Promise<BillingPaymentResource> => {
    const paymentAttempt = (await BaseResource._fetch({
      path: Billing.path(`/payment_attempts/${params.id}`, { orgId: params.orgId }),
      method: 'GET',
    })) as unknown as BillingPaymentJSON;
    return new BillingPayment(paymentAttempt);
  };

  startCheckout = async (params: CreateCheckoutParams) => {
    const { orgId, ...rest } = params;
    const json = (
      await BaseResource._fetch<BillingCheckoutJSON>({
        path: Billing.path(`/checkouts`, { orgId }),
        method: 'POST',
        body: rest as any,
      })
    )?.response as unknown as BillingCheckoutJSON;

    return new BillingCheckout(json);
  };

  /**
   * Registers an in-app purchase made through an app store (Apple App Store or Google Play) with Clerk.
   *
   * Posts the store purchase payload form-encoded (`store`, `payload`, and optionally `source`) to
   * `/me/billing/store_purchases`. The endpoint is idempotent by store transaction lineage, so replays (restore
   * purchases, out-of-band transaction listeners) resolve with the current subscription item. When `source` is
   * `'restore'`, a transaction bound to a different user transfers the subscription to the current user instead of
   * being rejected; when omitted, the backend defaults to `'purchase'` semantics. Store purchases are only supported
   * for user payers.
   *
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  registerStorePurchase = async (params: RegisterStorePurchaseParams): Promise<BillingSubscriptionItemResource> => {
    const json = (
      await BaseResource._fetch<BillingSubscriptionItemJSON>({
        // Store purchases are only supported for user payers, so the path is never org-scoped.
        path: Billing.path('/store_purchases'),
        method: 'POST',
        body: params as any,
      })
    )?.response as unknown as BillingSubscriptionItemJSON;

    return new BillingSubscriptionItem(json);
  };

  preflightStorePurchase = async (params: PreflightStorePurchaseParams): Promise<void> => {
    await BaseResource._fetch({
      path: Billing.path('/store_purchases/preflight'),
      method: 'POST',
      body: {
        store: params.store,
        product_id: params.productId,
        ...(params.purchaseOptionId ? { purchase_option_id: params.purchaseOptionId } : {}),
      } as any,
    });
  };

  getCreditBalance = async (params: GetCreditBalanceParams): Promise<BillingCreditBalanceResource> => {
    return await BaseResource._fetch({
      path: Billing.path('/credits', { orgId: params.orgId }),
      method: 'GET',
    }).then(res => new BillingCreditBalance(res?.response as unknown as BillingCreditBalanceJSON));
  };

  getCreditHistory = async (
    params: GetCreditHistoryParams,
  ): Promise<ClerkPaginatedResponse<BillingCreditLedgerResource>> => {
    return await BaseResource._fetch({
      path: Billing.path('/credits/history', { orgId: params.orgId }),
      method: 'GET',
    }).then(res => {
      const { data, total_count } = res?.response as unknown as {
        data: BillingCreditLedgerJSON[];
        total_count: number;
      };
      return {
        total_count,
        data: data.map(item => new BillingCreditLedger(item)),
      };
    });
  };
}
