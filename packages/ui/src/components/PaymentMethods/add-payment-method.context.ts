import { createContextAndHook } from '@clerk/shared/react';

import type { AddPaymentMethodContextData } from './add-payment-method.types';

export const [AddPaymentMethodContext, useAddPaymentMethodContext] =
  createContextAndHook<AddPaymentMethodContextData>('AddPaymentMethodRoot');
