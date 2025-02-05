import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';

export interface CommerceNamespace {
  getProducts: (params?: GetProductsParams) => Promise<ClerkPaginatedResponse<CommerceProductResource>>;
  getPlans: (params?: GetPlansParams) => Promise<CommercePlanResource[]>;
}

export type GetProductsParams = ClerkPaginationParams<{
  subscriberType?: string;
}>;

export interface CommerceProductResource extends ClerkResource {
  id: string;
  slug: string | null;
  currency: string;
  isDefault: boolean;
  plans: CommercePlanResource[];
}

export interface GetPlansParams {
  productId?: string;
}

export interface CommercePlanResource extends ClerkResource {
  id: string;
  name: string;
  amount: number;
  amountFormatted: string;
  annualMonthlyAmount: number;
  annualMonthlyAmountFormatted: string;
  currencySymbol: string;
  currency: string;
  description: string;
  isActiveForPayer: boolean;
  isRecurring: boolean;
  hasBaseFee: boolean;
  payerType: string[];
  publiclyVisible: boolean;
  slug: string;
  avatarUrl: string;
  features: CommerceFeatureResource[];
}

export interface CommerceFeatureResource extends ClerkResource {
  id: string;
  name: string;
  description: string;
  slug: string;
  avatarUrl: string;
}
