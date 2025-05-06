import type {
  CommerceMoney,
  CommercePaymentChargeType,
  CommercePaymentJSON,
  CommercePaymentStatus,
  CommerceStatementGroupJSON,
  CommerceStatementJSON,
  CommerceStatementResource,
  CommerceStatementStatus,
  CommerceStatementTotals,
} from '@clerk/types';

import { commerceMoneyFromJSON, commerceTotalsFromJSON } from '../../utils';
import { BaseResource, CommercePaymentSource, CommerceSubscription } from './internal';

export class CommerceStatement extends BaseResource implements CommerceStatementResource {
  id!: string;
  status!: CommerceStatementStatus;
  timestamp!: number;
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
    this.timestamp = data.timestamp;
    this.totals = commerceTotalsFromJSON(data.totals);
    this.groups = data.groups.map(group => new CommerceStatementGroup(group));
    return this;
  }
}

export class CommerceStatementGroup {
  id!: string;
  timestamp!: number;
  items!: CommercePayment[];

  constructor(data: CommerceStatementGroupJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceStatementGroupJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.timestamp = data.timestamp;
    this.items = data.items.map(item => new CommercePayment(item));
    return this;
  }
}

export class CommercePayment {
  id!: string;
  amount!: CommerceMoney;
  paymentSource!: CommercePaymentSource;
  subscription!: CommerceSubscription;
  chargeType!: CommercePaymentChargeType;
  status!: CommercePaymentStatus;

  constructor(data: CommercePaymentJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: CommercePaymentJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.amount = commerceMoneyFromJSON(data.amount);
    this.paymentSource = new CommercePaymentSource(data.payment_source);
    this.subscription = new CommerceSubscription(data.subscription);
    this.chargeType = data.charge_type;
    this.status = data.status;
    return this;
  }
}
