import type {
  __experimental_CommerceStatementJSON,
  __experimental_CommerceStatementResource,
  __experimental_CommerceStatementStatus,
  __experimental_CommerceStatementTotals,
} from '@clerk/types';

import { commerceTotalsFromJSON } from '../../utils';
import { BaseResource } from './internal';

export class __experimental_CommerceStatement extends BaseResource implements __experimental_CommerceStatementResource {
  id!: string;
  paymentDueOn!: number;
  paidOn!: number;
  status!: __experimental_CommerceStatementStatus;
  totals!: __experimental_CommerceStatementTotals;

  constructor(data: __experimental_CommerceStatementJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommerceStatementJSON | null): this {
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
