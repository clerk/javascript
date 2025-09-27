import type {
  BillingInitializedPaymentSourceJSON,
  BillingInitializedPaymentSourceResource,
  BillingPaymentSourceJSON,
  BillingPaymentSourceResource,
  BillingPaymentSourceStatus,
  DeletedObjectJSON,
  MakeDefaultPaymentSourceParams,
  RemovePaymentSourceParams,
} from '@clerk/types';

import { Billing } from '../modules/billing/namespace';
import { BaseResource, DeletedObject } from './internal';

export class BillingPaymentSource extends BaseResource implements BillingPaymentSourceResource {
  id!: string;
  last4!: string;
  paymentMethod!: string;
  cardType!: string;
  isDefault!: boolean;
  isRemovable!: boolean;
  status!: BillingPaymentSourceStatus;
  walletType: string | undefined;

  constructor(data: BillingPaymentSourceJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingPaymentSourceJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.last4 = data.last4;
    this.paymentMethod = data.payment_method;
    this.cardType = data.card_type;
    this.isDefault = data.is_default;
    this.isRemovable = data.is_removable;
    this.status = data.status;
    this.walletType = data.wallet_type ?? undefined;

    return this;
  }

  public async remove(params?: RemovePaymentSourceParams) {
    const { orgId } = params ?? {};
    const json = (
      await BaseResource._fetch({
        path: Billing.path(`/payment_sources/${this.id}`, { orgId }),
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    return new DeletedObject(json);
  }

  public async makeDefault(params?: MakeDefaultPaymentSourceParams) {
    const { orgId } = params ?? {};
    await BaseResource._fetch({
      path: Billing.path(`/payers/default_payment_source`, { orgId }),
      method: 'PUT',
      body: { payment_source_id: this.id } as any,
    });

    return null;
  }
}

export class BillingInitializedPaymentSource extends BaseResource implements BillingInitializedPaymentSourceResource {
  externalClientSecret!: string;
  externalGatewayId!: string;
  paymentMethodOrder!: string[];

  constructor(data: BillingInitializedPaymentSourceJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingInitializedPaymentSourceJSON | null): this {
    if (!data) {
      return this;
    }

    this.externalClientSecret = data.external_client_secret;
    this.externalGatewayId = data.external_gateway_id;
    this.paymentMethodOrder = data.payment_method_order ?? ['card'];
    return this;
  }
}
