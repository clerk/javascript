import type { __internal_CheckoutProps } from '@clerk/shared/types';

import { useCheckoutModel } from './checkout.model';
import { CheckoutView } from './checkout.view';

export const Checkout = (props: __internal_CheckoutProps) => {
  const model = useCheckoutModel(props);
  return <CheckoutView {...model} />;
};
