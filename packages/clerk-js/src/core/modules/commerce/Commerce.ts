import type {
  __experimental_AddPaymentSourceParams,
  __experimental_CommerceBillingNamespace,
  __experimental_CommerceInitializedPaymentSourceJSON,
  __experimental_CommerceNamespace,
  __experimental_CommercePaymentSourceJSON,
  __experimental_GetPaymentSourcesParams,
  __experimental_InitializePaymentSourceParams,
  ClerkPaginatedResponse,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import {
  __experimental_CommerceInitializedPaymentSource,
  __experimental_CommercePaymentSource,
  BaseResource,
} from '../../resources/internal';
import { __experimental_CommerceBilling } from './CommerceBilling';

export class __experimental_Commerce implements __experimental_CommerceNamespace {
  private static _billing: __experimental_CommerceBillingNamespace;

  get __experimental_billing(): __experimental_CommerceBillingNamespace {
    if (!__experimental_Commerce._billing) {
      __experimental_Commerce._billing = new __experimental_CommerceBilling();
    }
    return __experimental_Commerce._billing;
  }

  initializePaymentSource = async (params: __experimental_InitializePaymentSourceParams) => {
    const { orgId, ...rest } = params;
    const json = (
      await BaseResource._fetch({
        path: orgId
          ? `/organizations/${orgId}/commerce/payment_sources/initialize`
          : `/me/commerce/payment_sources/initialize`,
        method: 'POST',
        body: rest as any,
      })
    )?.response as unknown as __experimental_CommerceInitializedPaymentSourceJSON;
    return new __experimental_CommerceInitializedPaymentSource(json);
  };

  addPaymentSource = async (params: __experimental_AddPaymentSourceParams) => {
    const { orgId, ...rest } = params;

    const json = (
      await BaseResource._fetch({
        path: orgId ? `/organizations/${orgId}/commerce/payment_sources` : `/me/commerce/payment_sources`,
        method: 'POST',
        body: rest as any,
      })
    )?.response as unknown as __experimental_CommercePaymentSourceJSON;
    return new __experimental_CommercePaymentSource(json);
  };

  getPaymentSources = async (params: __experimental_GetPaymentSourcesParams) => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/commerce/payment_sources` : `/me/commerce/payment_sources`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: paymentSources, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<__experimental_CommercePaymentSourceJSON>;
      return {
        total_count,
        data: paymentSources.map(paymentSource => new __experimental_CommercePaymentSource(paymentSource)),
      };
    });
  };
}
