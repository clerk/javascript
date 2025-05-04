import type {
  __experimental_CommerceMoney,
  __experimental_CommercePaymentChargeType,
  __experimental_CommercePaymentJSON,
  __experimental_CommercePaymentStatus,
  __experimental_CommerceStatementGroupJSON,
  __experimental_CommerceStatementJSON,
  __experimental_CommerceStatementResource,
  __experimental_CommerceStatementStatus,
  __experimental_CommerceStatementTotals,
} from '@clerk/types';

import { commerceMoneyFromJSON, commerceTotalsFromJSON } from '../../utils';
import { __experimental_CommercePaymentSource, __experimental_CommerceSubscription, BaseResource } from './internal';

export class __experimental_CommerceStatement extends BaseResource implements __experimental_CommerceStatementResource {
  id!: string;
  status!: __experimental_CommerceStatementStatus;
  timestamp!: number;
  totals!: __experimental_CommerceStatementTotals;
  groups!: __experimental_CommerceStatementGroup[];

  constructor(data: __experimental_CommerceStatementJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommerceStatementJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.status = data.status;
    this.timestamp = data.timestamp;
    this.totals = commerceTotalsFromJSON(data.totals);
    this.groups = data.groups.map(group => new __experimental_CommerceStatementGroup(group));
    return this;
  }
}

export class __experimental_CommerceStatementGroup {
  id!: string;
  totals!: __experimental_CommerceStatementTotals;
  timestamp!: number;
  items!: __experimental_CommercePayment[];

  constructor(data: __experimental_CommerceStatementGroupJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommerceStatementGroupJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.totals = commerceTotalsFromJSON(data.totals);
    this.timestamp = data.timestamp;
    this.items = data.items.map(item => new __experimental_CommercePayment(item));
    return this;
  }
}

export class __experimental_CommercePayment {
  id!: string;
  amount!: __experimental_CommerceMoney;
  paymentSource!: __experimental_CommercePaymentSource;
  subscription!: __experimental_CommerceSubscription;
  chargeType!: __experimental_CommercePaymentChargeType;
  status!: __experimental_CommercePaymentStatus;

  constructor(data: __experimental_CommercePaymentJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommercePaymentJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.amount = commerceMoneyFromJSON(data.amount);
    this.paymentSource = new __experimental_CommercePaymentSource(data.payment_source);
    this.subscription = new __experimental_CommerceSubscription(data.subscription);
    this.chargeType = data.charge_type;
    this.status = data.status;
    return this;
  }
}
