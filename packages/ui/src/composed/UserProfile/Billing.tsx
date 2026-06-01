import { lazy, Suspense, type ReactNode } from 'react';

import { RouteContext } from '../../router/RouteContext';
import { useBillingRouter } from '../useBillingRouter';

const BillingPage = lazy(() =>
  import('../../components/UserProfile/BillingPage').then(m => ({
    default: m.BillingPage,
  })),
);

const PlansPage = lazy(() =>
  import('../../components/UserProfile/PlansPage').then(m => ({
    default: m.PlansPage,
  })),
);

const StatementPage = lazy(() =>
  import('../../components/Statements').then(m => ({
    default: m.StatementPage,
  })),
);

const PaymentAttemptPage = lazy(() =>
  import('../../components/PaymentAttempts').then(m => ({
    default: m.PaymentAttemptPage,
  })),
);

export const Billing = (): ReactNode => {
  const { router, route } = useBillingRouter();

  let content: ReactNode;
  switch (route.page) {
    case 'plans':
      content = <PlansPage />;
      break;
    case 'statement':
      content = <StatementPage />;
      break;
    case 'payment-attempt':
      content = <PaymentAttemptPage />;
      break;
    default:
      content = <BillingPage />;
  }

  return (
    <RouteContext.Provider value={router}>
      <Suspense fallback={''}>{content}</Suspense>
    </RouteContext.Provider>
  );
};
