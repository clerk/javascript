'use client';

import { lazy, type ReactNode } from 'react';

import { BillingSection } from '../BillingSection';

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

export const Billing = (): ReactNode => (
  <BillingSection
    billing={BillingPage}
    plans={PlansPage}
    statement={StatementPage}
    paymentAttempt={PaymentAttemptPage}
  />
);
