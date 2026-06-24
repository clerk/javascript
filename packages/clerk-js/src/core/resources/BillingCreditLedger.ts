import type { BillingCreditLedgerJSON, BillingCreditLedgerResource } from '@clerk/shared/types';

import { unixEpochToDate } from '@/utils/date';

import { BaseResource } from './internal';

export class BillingCreditLedger extends BaseResource implements BillingCreditLedgerResource {
  id!: string;
  payerId!: string;
  amount!: number;
  currency!: string;
  sourceType!: string;
  sourceId!: string;
  createdAt!: Date;

  constructor(data: BillingCreditLedgerJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingCreditLedgerJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.payerId = data.payer_id;
    this.amount = data.amount;
    this.currency = data.currency;
    this.sourceType = data.source_type;
    this.sourceId = data.source_id;
    this.createdAt = unixEpochToDate(data.created_at);
    return this;
  }
}
