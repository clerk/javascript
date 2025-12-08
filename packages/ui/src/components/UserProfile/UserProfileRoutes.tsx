import { lazy, Suspense } from 'react';

import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { USER_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useEnvironment, useUserProfileContext } from '../../contexts';
import { Route, Switch } from '../../router';
import { AccountPage } from './AccountPage';
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

export const UserProfileRoutes = () => {
  const { pages, shouldShowBilling, apiKeysProps } = useUserProfileContext();
  const { apiKeysSettings, commerceSettings } = useEnvironment();

  const isAccountPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT;
  const isSecurityPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.SECURITY;
  const isBillingPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.BILLING;
  const isAPIKeysPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.API_KEYS;

  const customPageRoutesWithContents = pages.contents?.map((customPage, index) => {
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
        {commerceSettings.billing.user.enabled && shouldShowBilling ? (
          <Route path={isBillingPageRoot ? undefined : 'billing'}>
            <Switch>
              <Route index>
                <Suspense fallback={''}>
                  <BillingPage />
                </Suspense>
              </Route>
              {commerceSettings.billing.user.hasPaidPlans ? (
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
            </Switch>
          </Route>
        ) : null}
        {apiKeysSettings.user_api_keys_enabled && !apiKeysProps?.hide && (
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
