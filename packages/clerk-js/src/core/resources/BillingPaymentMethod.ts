import type {
  BillingInitializedPaymentMethodJSON,
  BillingInitializedPaymentMethodResource,
  BillingPaymentMethodJSON,
  BillingPaymentMethodResource,
  BillingPaymentMethodStatus,
  DeletedObjectJSON,
  MakeDefaultPaymentMethodParams,
  RemovePaymentMethodParams,
} from '@clerk/types';

import { Billing } from '@/core/modules/billing';
import { unixEpochToDate } from '@/utils/date';

import { BaseResource, DeletedObject } from './internal';

export class BillingPaymentMethod extends BaseResource implements BillingPaymentMethodResource {
  id!: string;
  last4: string | null = null;
  paymentType?: 'card' | 'link';
  cardType: string | null = null;
  isDefault?: boolean;
  isRemovable?: boolean;
  status!: BillingPaymentMethodStatus;
  walletType?: string | null;
  expiryYear?: number | null;
  expiryMonth?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  constructor(data: BillingPaymentMethodJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingPaymentMethodJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.last4 = data.last4 ?? null;
    const rawPaymentType = data.payment_type ?? data.payment_method;
    this.paymentType = rawPaymentType === undefined ? undefined : (rawPaymentType as 'card' | 'link');
    this.cardType = data.card_type ?? null;
    this.isDefault = data.is_default ?? undefined;
    this.isRemovable = data.is_removable ?? undefined;
    this.status = data.status;
    this.walletType = data.wallet_type === undefined ? undefined : data.wallet_type;
    this.expiryYear = data.expiry_year ?? null;
    this.expiryMonth = data.expiry_month ?? null;
    this.createdAt =
      data.created_at === undefined ? undefined : data.created_at === null ? null : unixEpochToDate(data.created_at);
    this.updatedAt =
      data.updated_at === undefined ? undefined : data.updated_at === null ? null : unixEpochToDate(data.updated_at);

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
