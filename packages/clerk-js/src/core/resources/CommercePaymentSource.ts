import type { CommercePaymentSourceJSON, CommercePaymentSourceResource } from '@clerk/types';

import { BaseResource } from './internal';

export class CommercePaymentSource extends BaseResource implements CommercePaymentSourceResource {
  id!: string;
  last4!: string;
  paymentMethod!: string;
  cardType!: string;

  constructor(data: CommercePaymentSourceJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommercePaymentSourceJSON | null): this {
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
