import type { __internal_CheckoutProps } from '@clerk/shared/types';

import type { CheckoutData } from './checkout.types';

export const useCheckoutModel = (props: __internal_CheckoutProps): CheckoutData => ({
  subscriberType: props.for || 'user',
  checkoutContextValue: {
    componentName: 'Checkout' as const,
    ...props,
  },
});
