import { projectPaymentMethodPreview } from '../PaymentMethods/payment-methods.layout';
import type { CheckoutPaymentMethod, CheckoutPaymentMethodInput } from './checkout-mutations.types';

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

export const projectCheckoutPaymentMethod = (method: CheckoutPaymentMethodInput): CheckoutPaymentMethod => {
  const label =
    method.paymentType !== 'card'
      ? method.paymentType
        ? `${capitalize(method.paymentType)}`
        : '–'
      : method.cardType
        ? `${capitalize(method.cardType)} ⋯ ${method.last4}`
        : '–';

  return {
    id: method.id,
    isDefault: method.isDefault,
    label,
    preview: projectPaymentMethodPreview(method),
  };
};
