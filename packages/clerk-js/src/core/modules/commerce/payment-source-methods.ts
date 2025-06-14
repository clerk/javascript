import type {
  AddPaymentSourceParams,
  ClerkPaginatedResponse,
  CommerceInitializedPaymentSourceJSON,
  CommercePaymentSourceJSON,
  GetPaymentSourcesParams,
  InitializePaymentSourceParams,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import { BaseResource, CommerceInitializedPaymentSource, CommercePaymentSource } from '../../resources/internal';

export const initializePaymentSource = async (params: InitializePaymentSourceParams) => {
  const { orgId, ...rest } = params;
  const json = (
    await BaseResource._fetch({
      path: orgId
        ? `/organizations/${orgId}/commerce/payment_sources/initialize`
        : `/me/commerce/payment_sources/initialize`,
      method: 'POST',
      body: rest as any,
    })
  )?.response as unknown as CommerceInitializedPaymentSourceJSON;
  return new CommerceInitializedPaymentSource(json);
};

export const addPaymentSource = async (params: AddPaymentSourceParams) => {
  const { orgId, ...rest } = params;

  const json = (
    await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/commerce/payment_sources` : `/me/commerce/payment_sources`,
      method: 'POST',
      body: rest as any,
    })
  )?.response as unknown as CommercePaymentSourceJSON;
  return new CommercePaymentSource(json);
};

export const getPaymentSources = async (params: GetPaymentSourcesParams) => {
  const { orgId, ...rest } = params;

  return await BaseResource._fetch({
    path: orgId ? `/organizations/${orgId}/commerce/payment_sources` : `/me/commerce/payment_sources`,
    method: 'GET',
    search: convertPageToOffsetSearchParams(rest),
  }).then(res => {
    const { data: paymentSources, total_count } =
      res?.response as unknown as ClerkPaginatedResponse<CommercePaymentSourceJSON>; // oxlint-disable-line no-unsafe-optional-chaining
    return {
      total_count,
      data: paymentSources.map(paymentSource => new CommercePaymentSource(paymentSource)),
    };
  });
};
