import type {
  __experimental_CommercePaymentSourceJSON,
  __experimental_CommercePaymentSourceResource,
} from '@clerk/types';

import { BaseResource } from './internal';

export class __experimental_CommercePaymentSource
  extends BaseResource
  implements __experimental_CommercePaymentSourceResource
{
  id!: string;
  last4!: string;
  paymentMethod!: string;
  cardType!: string;

  constructor(data: __experimental_CommercePaymentSourceJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommercePaymentSourceJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.last4 = data.last4;
    this.paymentMethod = data.payment_method;
    this.cardType = data.card_type;

    return this;
  }
}
