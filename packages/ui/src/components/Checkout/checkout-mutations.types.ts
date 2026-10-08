import type { PaymentElementCheckoutData } from '@clerk/shared/react';
import type { ConfirmCheckoutParams } from '@clerk/shared/types';
import type { FormEvent } from 'react';

import type { LocalizationKey } from '../../localization';
import type { PaymentMethodPreview, PaymentMethodPreviewInput } from '../PaymentMethods/payment-methods.types';

export type CheckoutMutationsModel = {
  requestKey: string;
  canRun: () => boolean;
  confirmCheckout: (params: ConfirmCheckoutParams, canContinue?: () => boolean) => Promise<void>;
};

export type CheckoutMutationsData = {
  isLoading: boolean;
  error: string | undefined;
  confirmCheckout: (params: ConfirmCheckoutParams) => Promise<void>;
};

export type AddPaymentMethodForCheckoutModel = {
  requestKey: string | undefined;
  mutations: CheckoutMutationsModel;
  submitLabel: LocalizationKey;
  checkout: PaymentElementCheckoutData;
};

export type CheckoutPaymentMethodInput = PaymentMethodPreviewInput & { id: string };
export type CheckoutPaymentMethod = {
  id: string;
  isDefault: boolean | undefined;
  label: string;
  preview: PaymentMethodPreview;
};

export type ExistingPaymentMethodModel = {
  options: Array<{ value: string; label: string }>;
  initialSelectedPaymentMethod: CheckoutPaymentMethod | undefined;
  paymentMethods: CheckoutPaymentMethod[];
  showPaymentMethods: boolean | null;
  mutations: CheckoutMutationsModel;
};

export type ExistingPaymentMethodData = {
  payWithExistingPaymentMethod: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  error: string | undefined;
  selectedPaymentMethodId: string | undefined;
  selectedPaymentMethodPreview: PaymentMethodPreview | undefined;
  options: ExistingPaymentMethodModel['options'];
  selectPaymentMethod: (id: string) => void;
};
