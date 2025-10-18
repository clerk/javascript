import type {
  BillingInitializedPaymentMethodJSON,
  BillingInitializedPaymentMethodResource,
  BillingPaymentMethodJSON,
  BillingPaymentMethodResource,
  BillingPaymentMethodStatus,
  DeletedObjectJSON,
  MakeDefaultPaymentMethodParams,
  RemovePaymentMethodParams,
} from '@clerk/shared/types';

import { Billing } from '@/core/modules/billing';

import { BaseResource, DeletedObject } from './internal';

export class BillingPaymentMethod extends BaseResource implements BillingPaymentMethodResource {
  id!: string;
  last4!: string;
  paymentType!: 'card' | 'link';
  cardType!: string;
  isDefault!: boolean;
  isRemovable!: boolean;
  status!: BillingPaymentMethodStatus;
  walletType: string | undefined;

  constructor(data: BillingPaymentMethodJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingPaymentMethodJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.last4 = data.last4;
    this.paymentType = data.payment_type;
    this.cardType = data.card_type;
    this.isDefault = data.is_default;
    this.isRemovable = data.is_removable;
    this.status = data.status;
    this.walletType = data.wallet_type ?? undefined;

    return this;
  }

  public async remove(params?: RemovePaymentMethodParams) {
    const { orgId } = params ?? {};
    const json = (
      await BaseResource._fetch({
        path: Billing.path(`/payment_methods/${this.id}`, { orgId }),
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    return new DeletedObject(json);
  }

  public async makeDefault(params?: MakeDefaultPaymentMethodParams) {
    const { orgId } = params ?? {};
    await BaseResource._fetch({
      path: Billing.path(`/payers/default_payment_method`, { orgId }),
      method: 'PUT',
      body: { payment_method_id: this.id } as any,
    });

    return null;
  }
}

export class BillingInitializedPaymentMethod extends BaseResource implements BillingInitializedPaymentMethodResource {
  externalClientSecret!: string;
  externalGatewayId!: string;
  paymentMethodOrder!: string[];

  constructor(data: BillingInitializedPaymentMethodJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingInitializedPaymentMethodJSON | null): this {
    if (!data) {
      return this;
    }

    this.externalClientSecret = data.external_client_secret;
    this.externalGatewayId = data.external_gateway_id;
    this.paymentMethodOrder = data.payment_method_order ?? ['card'];
    return this;
  }
}
