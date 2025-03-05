import type {
  __experimental_CommerceBillingNamespace,
  ClerkPaginatedResponse,
  CommerceCheckoutJSON,
  CommerceProductJSON,
  CreateCheckoutParams,
  GetPlansParams,
  GetProductsParams,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import { BaseResource, CommerceCheckout, CommerceProduct } from '../../resources/internal';

export class __experimental_CommerceBilling implements __experimental_CommerceBillingNamespace {
  getProducts = async (params?: GetProductsParams) => {
    return await BaseResource._fetch({
      path: `/commerce/products`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(params),
    }).then(res => {
      const { data: products, total_count } = res as unknown as ClerkPaginatedResponse<CommerceProductJSON>;

      return {
        total_count,
        data: products.map(product => new CommerceProduct(product)),
      };
    });
  };

  getPlans = async (_?: GetPlansParams) => {
    const { data: products } = await this.getProducts();
    const defaultProduct = products.find(product => product.isDefault);

    return defaultProduct?.plans || [];
  };

  startCheckout = async (params: CreateCheckoutParams) => {
    const json = (
      await BaseResource._fetch<CommerceCheckoutJSON>({
        path: `/me/commerce/checkouts`,
        method: 'POST',
        body: params as any,
      })
    )?.response as unknown as CommerceCheckoutJSON;

    return new CommerceCheckout(json);
  };
}
