import type {
  ClerkPaginatedResponse,
  CommerceBillingNamespace,
  CommerceCheckoutResource,
  CommerceProductJSON,
  CreateCheckoutParams,
  GetPlansParams,
  GetProductsParams,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../../utils/convertPageToOffsetSearchParams';
import { BaseResource, CommerceProduct } from '../../resources/internal';

export class CommerceBilling implements CommerceBillingNamespace {
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

  getPlans = async (params?: GetPlansParams) => {
    const { data: products } = await this.getProducts();
    console.log(params);
    const defaultProduct = products.find(product => product.isDefault);

    return defaultProduct?.plans.sort((a, b) => a.amount - b.amount) || [];
  };

  startCheckout = async (params: CreateCheckoutParams) => {
    return await BaseResource._fetch({
      path: `/me/commerce/checkouts`,
      method: 'POST',
      body: params as any,
    }).then(res => {
      return res as unknown as CommerceCheckoutResource;
    });
  };
}
