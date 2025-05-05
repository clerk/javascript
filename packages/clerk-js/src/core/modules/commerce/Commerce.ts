import type {
  AddPaymentSourceParams,
  ClerkPaginatedResponse,
  CommerceBillingNamespace,
  CommerceInitializedPaymentSourceJSON,
  CommerceNamespace,
  CommercePaymentSourceJSON,
  GetPaymentSourcesParams,
  InitializePaymentSourceParams,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import { BaseResource, CommerceInitializedPaymentSource, CommercePaymentSource } from '../../resources/internal';
import { CommerceBilling } from './CommerceBilling';

export class Commerce implements CommerceNamespace {
  private static _billing: CommerceBillingNamespace;

  get billing(): CommerceBillingNamespace {
    if (!Commerce._billing) {
      Commerce._billing = new CommerceBilling();
    }
    return Commerce._billing;
  }

  initializePaymentSource = async (params: InitializePaymentSourceParams) => {
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

  addPaymentSource = async (params: AddPaymentSourceParams) => {
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

  getPaymentSources = async (params: GetPaymentSourcesParams) => {
    const { orgId, ...rest } = params;

    return await BaseResource._fetch({
      path: orgId ? `/organizations/${orgId}/commerce/payment_sources` : `/me/commerce/payment_sources`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(rest),
    }).then(res => {
      const { data: paymentSources, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<CommercePaymentSourceJSON>;
      return {
        total_count,
        data: paymentSources.map(paymentSource => new CommercePaymentSource(paymentSource)),
      };
    });
  };
}
