import type {
  CommerceInvoiceJSON,
  CommerceInvoiceResource,
  CommerceInvoiceStatus,
  CommerceInvoiceTotals,
} from '@clerk/types';

import { commerceTotalsFromJSON } from '../../utils';
import { BaseResource } from './internal';

export class CommerceInvoice extends BaseResource implements CommerceInvoiceResource {
  id!: string;
  paymentDueOn!: number;
  paidOn!: number;
  status!: CommerceInvoiceStatus;
  totals!: CommerceInvoiceTotals;

  constructor(data: CommerceInvoiceJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceInvoiceJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.paymentDueOn = data.payment_due_on;
    this.paidOn = data.paid_on;
    this.status = data.status;
    this.totals = commerceTotalsFromJSON(data.totals);

    return this;
  }
}
