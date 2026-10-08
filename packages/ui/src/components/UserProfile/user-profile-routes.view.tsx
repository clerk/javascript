import { lazy, Suspense } from 'react';

import { CustomPageContentContainer } from '@/ui/common/CustomPageContentContainer';
import { Route, Switch } from '@/ui/router';

import { AccountPage } from './AccountPage';
import type { UserProfileRoutesData } from './profile-sections.types';
import { SecurityPage } from './SecurityPage';

const BillingPage = lazy(() =>
  import(/* webpackChunkName: "up-billing-page"*/ './BillingPage').then(module => ({
    default: module.BillingPage,
  })),
);

const APIKeysPage = lazy(() =>
  import(/* webpackChunkName: "up-api-keys-page"*/ './APIKeysPage').then(module => ({
    default: module.APIKeysPage,
  })),
);

const PlansPage = lazy(() =>
  import(/* webpackChunkName: "up-plans-page"*/ './PlansPage').then(module => ({
    default: module.PlansPage,
  })),
);

const StatementPage = lazy(() =>
  import(/* webpackChunkName: "statement-page"*/ '../Statements').then(module => ({
    default: module.StatementPage,
  })),
);

const PaymentAttemptPage = lazy(() =>
  import(/* webpackChunkName: "payment-attempt-page"*/ '../PaymentAttempts').then(module => ({
    default: module.PaymentAttemptPage,
  })),
);

const CreditHistoryPage = lazy(() =>
  import(/* webpackChunkName: "credit-history-page"*/ '../AccountCredits').then(module => ({
    default: module.CreditHistoryPage,
  })),
);

export const UserProfileRoutesView = ({
  isAccountPageRoot,
  isSecurityPageRoot,
  isBillingPageRoot,
  isAPIKeysPageRoot,
  customPages,
  showBilling,
  hasPaidPlans,
  showAPIKeys,
}: UserProfileRoutesData) => {
  const customPageRoutesWithContents = customPages?.map((customPage, index) => {
    const shouldFirstCustomItemBeOnRoot = !isAccountPageRoot && !isSecurityPageRoot && index === 0;
    return (
      <Route
        index={shouldFirstCustomItemBeOnRoot}
        path={shouldFirstCustomItemBeOnRoot ? undefined : customPage.url}
        key={`custom-page-${customPage.url}`}
      >
        <CustomPageContentContainer
          mount={customPage.mount}
          unmount={customPage.unmount}
        />
      </Route>
    );
  });

  return (
    <Switch>
      {customPageRoutesWithContents}
      <Route>
        <Route path={isAccountPageRoot ? undefined : 'account'}>
          <Switch>
            <Route index>
              <AccountPage />
            </Route>
          </Switch>
        </Route>
        <Route path={isSecurityPageRoot ? undefined : 'security'}>
          <Switch>
            <Route index>
              <SecurityPage />
            </Route>
          </Switch>
        </Route>
        {showBilling ? (
          <Route path={isBillingPageRoot ? undefined : 'billing'}>
            <Switch>
              <Route index>
                <Suspense fallback={''}>
                  <BillingPage />
                </Suspense>
              </Route>
              {hasPaidPlans ? (
                <Route path='plans'>
                  <Suspense fallback={''}>
                    <PlansPage />
                  </Suspense>
                </Route>
              ) : null}
              <Route path='statement/:statementId'>
                <Suspense fallback={''}>
                  <StatementPage />
                </Suspense>
              </Route>
              <Route path='payment-attempt/:paymentAttemptId'>
                <Suspense fallback={''}>
                  <PaymentAttemptPage />
                </Suspense>
              </Route>
              <Route path='credit-history'>
                <Suspense fallback={''}>
                  <CreditHistoryPage />
                </Suspense>
              </Route>
            </Switch>
          </Route>
        ) : null}
        {showAPIKeys && (
          <Route path={isAPIKeysPageRoot ? undefined : 'api-keys'}>
            <Switch>
              <Route index>
                <Suspense fallback={''}>
                  <APIKeysPage />
                </Suspense>
              </Route>
            </Switch>
          </Route>
        )}
      </Route>
    </Switch>
  );
};
