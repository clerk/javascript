import type { PaymentMethodPreview, PaymentMethodPreviewInput } from './payment-methods.types';

export const projectPaymentMethodPreview = (paymentMethod: PaymentMethodPreviewInput): PaymentMethodPreview => ({
  isCard: paymentMethod.paymentType === 'card',
  displayType: paymentMethod.paymentType === 'card' ? paymentMethod.cardType : paymentMethod.paymentType,
  last4Text: paymentMethod.paymentType === 'card' ? `⋯ ${paymentMethod.last4}` : null,
  isDefault: paymentMethod.isDefault,
  isExpired: paymentMethod.status === 'expired',
});
