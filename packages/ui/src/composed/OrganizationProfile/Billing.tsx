'use client';

import { lazy, type ReactNode } from 'react';

import { BillingSection } from '../BillingSection';

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

export const Billing = (): ReactNode => (
  <BillingSection
    billing={OrganizationBillingPage}
    plans={OrganizationPlansPage}
    statement={OrganizationStatementPage}
    paymentAttempt={OrganizationPaymentAttemptPage}
  />
);
