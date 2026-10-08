import type { LocalizationKey } from '../../localization';

export type PaymentMethodPreviewInput = {
  paymentType?: 'card';
  cardType: string | null;
  last4: string | null;
  isDefault?: boolean;
  status: string;
};

export type PaymentMethodPreview = {
  isCard: boolean;
  displayType: string | null | undefined;
  last4Text: string | null;
  isDefault: boolean | undefined;
  isExpired: boolean;
};

export type PaymentMethodItem = PaymentMethodPreview & {
  id: string;
  identifier: string;
  isRemovable: boolean | undefined;
  remove: (canContinue?: () => boolean) => Promise<boolean>;
  makeDefault: (canContinue?: () => boolean) => Promise<boolean>;
};

export type RevalidatePaymentMethods = (canContinue?: () => boolean) => Promise<boolean>;
export type PaymentMethodsLocalizationRoot = 'userProfile' | 'organizationProfile';

export type PaymentMethodsModel = {
  subject: string | undefined;
  scope: string;
  isVisible: boolean;
  canAdd: boolean;
  localizationRoot: PaymentMethodsLocalizationRoot;
  isLoading: boolean;
  paymentMethods: PaymentMethodItem[];
  revalidate: RevalidatePaymentMethods;
};

export type PaymentToken = { gateway: 'stripe'; paymentToken: string };

export type AddPaymentMethodModel = {
  scope: string;
  localizationRoot: PaymentMethodsLocalizationRoot;
  addPaymentMethod: (token: PaymentToken, canContinue?: () => boolean) => Promise<boolean>;
};

export type AddPaymentMethodScreenData = {
  localizationRoot: PaymentMethodsLocalizationRoot;
  cancel: () => void;
  onSuccess: (token: PaymentToken, canContinue?: () => boolean) => Promise<void>;
};

export type RemovePaymentMethodScreenData = {
  identifier: string;
  localizationRoot: PaymentMethodsLocalizationRoot;
  close: () => void;
  remove: (canContinue?: () => boolean) => Promise<boolean>;
};

export type PaymentMethodMenuData = {
  actions: Array<{ label: LocalizationKey; isDestructive: boolean; onClick: () => void; isDisabled: boolean }>;
};

export type PaymentMethodRowData = Omit<PaymentMethodItem, 'makeDefault'> & {
  makeDefault: () => void;
  isPending: boolean;
  canOpen: () => boolean;
};

export type PaymentMethodsData = Omit<PaymentMethodsModel, 'paymentMethods'> & {
  paymentMethods: PaymentMethodRowData[];
};
