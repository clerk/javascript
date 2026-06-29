import type { BillingCreditLedgerJSON, BillingCreditLedgerResource, BillingMoneyAmount } from '@clerk/shared/types';

import { unixEpochToDate } from '@/utils/date';
import { billingMoneyAmountFromJSON } from '@/utils/billing';

import { BaseResource } from './internal';

export class BillingCreditLedger extends BaseResource implements BillingCreditLedgerResource {
  id!: string;
  amount!: BillingMoneyAmount;
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
    this.amount = billingMoneyAmountFromJSON(data.amount);
    this.sourceType = data.source_type;
    this.sourceId = data.source_id;
    this.createdAt = unixEpochToDate(data.created_at);
    return this;
  }
}
