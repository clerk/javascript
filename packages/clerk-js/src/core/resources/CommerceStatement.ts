import type {
  CommerceStatementGroupJSON,
  CommerceStatementJSON,
  CommerceStatementResource,
  CommerceStatementStatus,
  CommerceStatementTotals,
} from '@clerk/types';

import { commerceTotalsFromJSON } from '../../utils';
import { unixEpochToDate } from '../../utils/date';
import { BaseResource, CommercePayment } from './internal';

export class CommerceStatement extends BaseResource implements CommerceStatementResource {
  id!: string;
  status!: CommerceStatementStatus;
  timestamp!: Date;
  totals!: CommerceStatementTotals;
  groups!: CommerceStatementGroup[];

  constructor(data: CommerceStatementJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceStatementJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.status = data.status;
    this.timestamp = unixEpochToDate(data.timestamp);
    this.totals = commerceTotalsFromJSON(data.totals);
    this.groups = data.groups.map(group => new CommerceStatementGroup(group));
    return this;
  }
}

export class CommerceStatementGroup {
  id!: string;
  timestamp!: Date;
  items!: CommercePayment[];

  constructor(data: CommerceStatementGroupJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceStatementGroupJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.timestamp = unixEpochToDate(data.timestamp);
    this.items = data.items.map(item => new CommercePayment(item));
    return this;
  }
}
