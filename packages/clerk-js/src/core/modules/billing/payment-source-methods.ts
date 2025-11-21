import type {
  AddPaymentMethodParams,
  BillingInitializedPaymentMethodJSON,
  BillingPaymentMethodJSON,
  ClerkPaginatedResponse,
  GetPaymentMethodsParams,
  InitializePaymentMethodParams,
} from '@clerk/shared/types';

import { BaseResource } from '@/core/resources/Base';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import { BillingInitializedPaymentMethod, BillingPaymentMethod } from '../../resources/internal';
import { Billing } from './namespace';

const PAYMENT_METHODS_PATH = '/payment_methods';

type WithOptionalOrgType<T> = T & {
  orgId?: string;
};

export const initializePaymentMethod = async (params: WithOptionalOrgType<InitializePaymentMethodParams>) => {
  const { orgId, ...rest } = params;
  const json = (
    await BaseResource._fetch({
      path: Billing.path(`${PAYMENT_METHODS_PATH}/initialize`, { orgId }),
      method: 'POST',
      body: rest as any,
    })
  )?.response as unknown as BillingInitializedPaymentMethodJSON;
  return new BillingInitializedPaymentMethod(json);
};

export const addPaymentMethod = async (params: WithOptionalOrgType<AddPaymentMethodParams>) => {
  const { orgId, ...rest } = params;

  const json = (
    await BaseResource._fetch({
      path: Billing.path(PAYMENT_METHODS_PATH, { orgId }),
      method: 'POST',
      body: rest as any,
    })
  )?.response as unknown as BillingPaymentMethodJSON;
  return new BillingPaymentMethod(json);
};

export const getPaymentMethods = async (params?: WithOptionalOrgType<GetPaymentMethodsParams>) => {
  const { orgId, ...rest } = params ?? {};

  return await BaseResource._fetch({
    path: Billing.path(PAYMENT_METHODS_PATH, { orgId }),
    method: 'GET',
    search: convertPageToOffsetSearchParams(rest),
  }).then(res => {
    const { data, total_count } = res?.response as unknown as ClerkPaginatedResponse<BillingPaymentMethodJSON>;
    return {
      total_count,
      data: data.map(paymentMethod => new BillingPaymentMethod(paymentMethod)),
    };
  });
};
