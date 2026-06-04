import { Suspense, type ComponentType, type ReactNode } from 'react';

import { RouteContext } from '../router/RouteContext';
import { useBillingRouter } from './useBillingRouter';

type BillingSectionProps = {
  billing: ComponentType;
  plans: ComponentType;
  statement: ComponentType;
  paymentAttempt: ComponentType;
};

export function BillingSection({
  billing: Billing,
  plans: Plans,
  statement: Statement,
  paymentAttempt: PaymentAttempt,
}: BillingSectionProps): ReactNode {
  const { router, route } = useBillingRouter();

  let content: ReactNode;
  switch (route.page) {
    case 'plans':
      content = <Plans />;
      break;
    case 'statement':
      content = <Statement />;
      break;
    case 'payment-attempt':
      content = <PaymentAttempt />;
      break;
    default:
      content = <Billing />;
  }

  return (
    <RouteContext.Provider value={router}>
      <Suspense fallback={null}>{content}</Suspense>
    </RouteContext.Provider>
  );
}
