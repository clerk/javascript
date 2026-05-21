import { lazy, Suspense } from 'react';

import { RouteContext } from '../../router/RouteContext';
import { useBillingRouter } from '../useBillingRouter';

const OrganizationBillingPage = lazy(() =>
  import('../../components/OrganizationProfile/OrganizationBillingPage').then(m => ({
    default: m.OrganizationBillingPage,
  })),
);

const OrganizationPlansPage = lazy(() =>
  import('../../components/OrganizationProfile/OrganizationPlansPage').then(m => ({
    default: m.OrganizationPlansPage,
  })),
);

const OrganizationStatementPage = lazy(() =>
  import('../../components/OrganizationProfile/OrganizationStatementPage').then(m => ({
    default: m.OrganizationStatementPage,
  })),
);

const OrganizationPaymentAttemptPage = lazy(() =>
  import('../../components/OrganizationProfile/OrganizationPaymentAttemptPage').then(m => ({
    default: m.OrganizationPaymentAttemptPage,
  })),
);

export const Billing = () => {
  const { router, route } = useBillingRouter();

  let content: React.ReactNode;
  switch (route.page) {
    case 'plans':
      content = <OrganizationPlansPage />;
      break;
    case 'statement':
      content = <OrganizationStatementPage />;
      break;
    case 'payment-attempt':
      content = <OrganizationPaymentAttemptPage />;
      break;
    default:
      content = <OrganizationBillingPage />;
  }

  return (
    <RouteContext.Provider value={router}>
      <Suspense fallback={''}>{content}</Suspense>
    </RouteContext.Provider>
  );
};
