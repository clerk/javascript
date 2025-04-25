import type {
  __experimental_CommerceInvoiceJSON,
  __experimental_CommerceInvoiceResource,
  __experimental_CommerceInvoiceStatus,
  __experimental_CommerceInvoiceTotals,
} from '@clerk/types';

import { commerceTotalsFromJSON } from '../../utils';
import { BaseResource } from './internal';

export class __experimental_CommerceInvoice extends BaseResource implements __experimental_CommerceInvoiceResource {
  id!: string;
  paymentSourceId!: string;
  planId!: string;
  paymentDueOn!: number;
  paidOn!: number;
  status!: __experimental_CommerceInvoiceStatus;
  totals!: __experimental_CommerceInvoiceTotals;

  constructor(data: __experimental_CommerceInvoiceJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommerceInvoiceJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.paymentSourceId = data.payment_source_id;
    this.planId = data.plan_id;
    this.paymentDueOn = data.payment_due_on;
    this.paidOn = data.paid_on;
    this.status = data.status;
    this.totals = commerceTotalsFromJSON(data.totals);

    return this;
  }
}
