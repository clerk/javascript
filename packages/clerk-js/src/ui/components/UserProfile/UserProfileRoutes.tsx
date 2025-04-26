import { lazy, Suspense } from 'react';

import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { USER_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import {
  __experimental_PricingTableContext,
  InvoicesContextProvider,
  useEnvironment,
  useUserProfileContext,
} from '../../contexts';
import { Route, Switch } from '../../router';
import { InvoicePage } from '../Invoices/InvoicePage';
import { AccountPage } from './AccountPage';
import { SecurityPage } from './SecurityPage';
import { __experimental_PricingTable } from '../PricingTable/PricingTable';
import { PlansPage } from './PlansPage';

const BillingPage = lazy(() =>
  import(/* webpackChunkName: "up-billing-page"*/ './BillingPage').then(module => ({
    default: module.BillingPage,
  })),
);

export const UserProfileRoutes = () => {
  const { pages } = useUserProfileContext();
  const { __experimental_commerceSettings } = useEnvironment();

  const isAccountPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT;
  const isSecurityPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.SECURITY;
  const isBillingPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.BILLING;

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
        {__experimental_commerceSettings.billing.enabled &&
          __experimental_commerceSettings.billing.hasPaidUserPlans && (
            <Route path={isBillingPageRoot ? undefined : 'billing'}>
              <Switch>
                <Route index>
                  <Suspense fallback={''}>
                    <BillingPage />
                  </Suspense>
                </Route>
                <Route path='plans'>
                  {/* TODO(@commerce): Should this be lazy loaded ? */}
                  <Suspense fallback={''}>
                    <PlansPage />
                  </Suspense>
                </Route>
                <Route path='invoice/:invoiceId'>
                  {/* TODO(@commerce): Should this be lazy loaded ? */}
                  <Suspense fallback={''}>
                    <InvoicesContextProvider>
                      <InvoicePage />
                    </InvoicesContextProvider>
                  </Suspense>
                </Route>
              </Switch>
            </Route>
          )}
      </Route>
    </Switch>
  );
};
