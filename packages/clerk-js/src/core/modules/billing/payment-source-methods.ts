import type {
  AddPaymentSourceParams,
  BillingInitializedPaymentSourceJSON,
  BillingPaymentSourceJSON,
  ClerkPaginatedResponse,
  GetPaymentSourcesParams,
  InitializePaymentSourceParams,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import { BaseResource, BillingInitializedPaymentSource, BillingPaymentSource } from '../../resources/internal';
import { Billing } from './namespace';

export const initializePaymentSource = async (params: InitializePaymentSourceParams) => {
  const { orgId, ...rest } = params;
  const json = (
    await BaseResource._fetch({
      path: Billing.path(`/payment_sources/initialize`, { orgId }),
      method: 'POST',
      body: rest as any,
    })
  )?.response as unknown as BillingInitializedPaymentSourceJSON;
  return new BillingInitializedPaymentSource(json);
};

export const addPaymentSource = async (params: AddPaymentSourceParams) => {
  const { orgId, ...rest } = params;

  const json = (
    await BaseResource._fetch({
      path: Billing.path(`/payment_sources`, { orgId }),
      method: 'POST',
      body: rest as any,
    })
  )?.response as unknown as BillingPaymentSourceJSON;
  return new BillingPaymentSource(json);
};

export const getPaymentSources = async (params: GetPaymentSourcesParams) => {
  const { orgId, ...rest } = params;

  return await BaseResource._fetch({
    path: Billing.path(`/payment_sources`, { orgId }),
    method: 'GET',
    search: convertPageToOffsetSearchParams(rest),
  }).then(res => {
    const { data: paymentSources, total_count } =
      res?.response as unknown as ClerkPaginatedResponse<BillingPaymentSourceJSON>;
    return {
      total_count,
      data: paymentSources.map(paymentSource => new BillingPaymentSource(paymentSource)),
    };
  });
};
