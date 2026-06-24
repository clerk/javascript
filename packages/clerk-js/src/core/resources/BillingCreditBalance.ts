import type { BillingCreditBalanceJSON, BillingCreditBalanceResource, BillingMoneyAmount } from '@clerk/shared/types';
import { billingMoneyAmountFromJSON } from '../../utils';

export class BillingCreditBalance implements BillingCreditBalanceResource {
  balance: BillingMoneyAmount | null;

  constructor(data: BillingCreditBalanceJSON) {
    this.balance = data.balance ? billingMoneyAmountFromJSON(data.balance) : null;
  }
}
