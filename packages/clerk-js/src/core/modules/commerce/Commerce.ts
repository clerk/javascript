import type {
  AddPaymentSourceParams,
  ClerkPaginatedResponse,
  CommerceBillingNamespace,
  CommerceNamespace,
  CommercePaymentSourceJSON,
} from '@clerk/types';

import { BaseResource, CommercePaymentSource } from '../../resources/internal';
import { CommerceBilling } from './CommerceBilling';

export class Commerce implements CommerceNamespace {
  public static _billing: CommerceBillingNamespace;

  get billing(): CommerceBillingNamespace {
    if (!Commerce._billing) {
      Commerce._billing = new CommerceBilling();
    }
    return Commerce._billing;
  }

  addPaymentSource = async (params: AddPaymentSourceParams) => {
    const json = (
      await BaseResource._fetch({
        path: `/me/commerce/payment_sources`,
        method: 'POST',
        body: params as any,
      })
    )?.response as unknown as CommercePaymentSourceJSON;
    return new CommercePaymentSource(json);
  };

  getPaymentSources = async () => {
    return await BaseResource._fetch({
      path: `/me/commerce/payment_sources`,
      method: 'GET',
    }).then(res => {
      const { data: paymentSources, total_count } = res as unknown as ClerkPaginatedResponse<CommercePaymentSourceJSON>;
      return {
        total_count,
        data: paymentSources.map(paymentSource => new CommercePaymentSource(paymentSource)),
      };
    });
  };
}
