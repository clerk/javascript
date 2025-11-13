import type {
  BillingStatementGroupJSON,
  BillingStatementJSON,
  BillingStatementResource,
  BillingStatementStatus,
  BillingStatementTotals,
} from '@clerk/shared/types';

import { billingTotalsFromJSON } from '../../utils';
import { unixEpochToDate } from '../../utils/date';
import { BaseResource, BillingPayment } from './internal';

export class BillingStatement extends BaseResource implements BillingStatementResource {
  id!: string;
  status!: BillingStatementStatus;
  timestamp!: Date;
  totals!: BillingStatementTotals;
  groups!: BillingStatementGroup[];

  constructor(data: BillingStatementJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingStatementJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.status = data.status;
    this.timestamp = unixEpochToDate(data.timestamp);
    this.totals = billingTotalsFromJSON(data.totals);
    this.groups = data.groups.map(group => new BillingStatementGroup(group));
    return this;
  }
}

export class BillingStatementGroup {
  id!: string;
  timestamp!: Date;
  items!: BillingPayment[];

  constructor(data: BillingStatementGroupJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingStatementGroupJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.timestamp = unixEpochToDate(data.timestamp);
    this.items = data.items.map(item => new BillingPayment(item));
    return this;
  }
}
