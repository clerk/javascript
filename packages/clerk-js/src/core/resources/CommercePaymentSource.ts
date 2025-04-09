import type {
  __experimental_CommerceInitializedPaymentSourceJSON,
  __experimental_CommerceInitializedPaymentSourceResource,
  __experimental_CommercePaymentSourceJSON,
  __experimental_CommercePaymentSourceResource,
  __experimental_CommercePaymentSourceStatus,
  __experimental_MakeDefaultPaymentSourceParams,
  __experimental_RemovePaymentSourceParams,
  DeletedObjectJSON,
} from '@clerk/types';

import { BaseResource, DeletedObject } from './internal';

export class __experimental_CommercePaymentSource
  extends BaseResource
  implements __experimental_CommercePaymentSourceResource
{
  id!: string;
  last4!: string;
  paymentMethod!: string;
  cardType!: string;
  isDefault!: boolean;
  status!: __experimental_CommercePaymentSourceStatus;
  walletType: string | undefined;

  constructor(data: __experimental_CommercePaymentSourceJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommercePaymentSourceJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.last4 = data.last4;
    this.paymentMethod = data.payment_method;
    this.cardType = data.card_type;
    this.isDefault = data.is_default;
    this.status = data.status;
    this.walletType = data.wallet_type ?? undefined;

    return this;
  }

  public async remove(params?: __experimental_RemovePaymentSourceParams) {
    const { orgId } = params ?? {};
    const json = (
      await BaseResource._fetch({
        path: orgId
          ? `/organizations/${orgId}/commerce/payment_sources/${this.id}`
          : `/me/commerce/payment_sources/${this.id}`,
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    return new DeletedObject(json);
  }

  public async makeDefault(params?: __experimental_MakeDefaultPaymentSourceParams) {
    const { orgId } = params ?? {};
    await BaseResource._fetch({
      path: orgId
        ? `/organizations/${orgId}/commerce/payers/default_payment_source`
        : `/me/commerce/payers/default_payment_source`,
      method: 'PUT',
      body: { payment_source_id: this.id } as any,
    });

    return null;
  }
}

export class __experimental_CommerceInitializedPaymentSource
  extends BaseResource
  implements __experimental_CommerceInitializedPaymentSourceResource
{
  externalClientSecret!: string;
  externalGatewayId!: string;

  constructor(data: __experimental_CommerceInitializedPaymentSourceJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommerceInitializedPaymentSourceJSON | null): this {
    if (!data) {
      return this;
    }

    this.externalClientSecret = data.external_client_secret;
    this.externalGatewayId = data.external_gateway_id;

    return this;
  }
}
