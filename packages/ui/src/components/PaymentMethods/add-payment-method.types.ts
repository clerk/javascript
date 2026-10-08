import type { PaymentElementCheckoutData } from '@clerk/shared/react';
import type { FormEvent, RefObject } from 'react';

import type { LocalizationKey } from '../../localization';
import type { PaymentMethodsLocalizationRoot } from './payment-methods.types';

export type AddPaymentMethodSubmission =
  | { status: 'validation_error' }
  | { status: 'error'; message: string | undefined }
  | { status: 'ready' }
  | { status: 'cancelled' };

export type AddPaymentMethodFormModel = {
  headerTitle: LocalizationKey | undefined;
  headerSubtitle: LocalizationKey | undefined;
  submitLabel: LocalizationKey | undefined;
  hasCheckout: boolean;
  cancelAction: (() => void) | undefined;
  localizationRoot: PaymentMethodsLocalizationRoot;
  isProviderReady: boolean;
  isFormReady: boolean;
  requestKey: string;
  canRun: () => boolean;
  submit: (canContinue: () => boolean) => Promise<AddPaymentMethodSubmission>;
  complete: (canContinue: () => boolean) => Promise<boolean>;
  reset: (canContinue: () => boolean) => Promise<void>;
};

export type AddPaymentMethodFormData = Pick<
  AddPaymentMethodFormModel,
  'requestKey' | 'headerTitle' | 'headerSubtitle' | 'cancelAction' | 'hasCheckout' | 'isFormReady' | 'isProviderReady'
> & {
  submitLabel: LocalizationKey;
  error: string | undefined;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export type AddPaymentMethodProps = {
  onSuccess: (token: { gateway: 'stripe'; paymentToken: string }, canContinue?: () => boolean) => Promise<void>;
  requestKey?: string;
  checkout?: PaymentElementCheckoutData;
  cancelAction?: () => void;
};

export type AddPaymentMethodContextData = {
  headerTitle: LocalizationKey | undefined;
  headerSubtitle: LocalizationKey | undefined;
  submitLabel: LocalizationKey | undefined;
  setHeaderTitle: (title: LocalizationKey) => void;
  setHeaderSubtitle: (subtitle: LocalizationKey) => void;
  setSubmitLabel: (label: LocalizationKey) => void;
  hasCheckout: boolean;
  onSuccess: AddPaymentMethodProps['onSuccess'];
  cancelAction: (() => void) | undefined;
};

export type AddPaymentMethodRootModel = {
  requestKey: string;
  checkout: PaymentElementCheckoutData | undefined;
  subscriberType: 'user' | 'organization';
  stripeAppearanceNode: RefObject<HTMLDivElement>;
  stripeAppearance:
    | {
        colorPrimary: string;
        colorBackground: string;
        colorText: string;
        colorTextSecondary: string;
        colorSuccess: string;
        colorDanger: string;
        colorWarning: string;
        fontWeightNormal: string;
        fontWeightMedium: string;
        fontWeightBold: string;
        fontSizeXl: string;
        fontSizeLg: string;
        fontSizeSm: string;
        fontSizeXs: string;
        borderRadius: string;
        spacingUnit: string;
      }
    | undefined;
  paymentDescription: string;
};
