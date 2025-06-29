import type {
  CommerceInitializedPaymentSourceJSON,
  CommerceInitializedPaymentSourceResource,
  CommercePaymentSourceJSON,
  CommercePaymentSourceResource,
  CommercePaymentSourceStatus,
  DeletedObjectJSON,
  MakeDefaultPaymentSourceParams,
  RemovePaymentSourceParams,
} from '@clerk/types';

import { BaseResource, DeletedObject } from './internal';
import { parseJSON } from './parser';

export class CommercePaymentSource extends BaseResource implements CommercePaymentSourceResource {
  id!: string;
  last4!: string;
  paymentMethod!: string;
  cardType!: string;
  isDefault!: boolean;
  isRemovable!: boolean;
  status!: CommercePaymentSourceStatus;
  walletType: string | undefined;

  constructor(data: CommercePaymentSourceJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommercePaymentSourceJSON | null): this {
    Object.assign(
      this,
      parseJSON<CommercePaymentSource>(data, {
        defaultValues: {
          walletType: undefined,
        },
      }),
    );
    return this;
  }

  public async remove(params?: RemovePaymentSourceParams) {
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

  public async makeDefault(params?: MakeDefaultPaymentSourceParams) {
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

export class CommerceInitializedPaymentSource extends BaseResource implements CommerceInitializedPaymentSourceResource {
  externalClientSecret!: string;
  externalGatewayId!: string;
  paymentMethodOrder!: string[];

  constructor(data: CommerceInitializedPaymentSourceJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceInitializedPaymentSourceJSON | null): this {
    Object.assign(
      this,
      parseJSON<CommerceInitializedPaymentSource>(data, {
        defaultValues: {
          paymentMethodOrder: ['card'],
        },
      }),
    );
    return this;
  }
}
