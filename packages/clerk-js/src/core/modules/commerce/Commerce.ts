import type { AddPaymentSourceParams, CommerceBillingNamespace, CommerceNamespace } from '@clerk/types';

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
    console.log(params);
    return await Promise.resolve();
  };
}
