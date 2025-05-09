import { lazy, Suspense } from 'react';

import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { USER_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useEnvironment, useUserProfileContext } from '../../contexts';
import { Route, Switch } from '../../router';
import { StatementPage } from '../Statements';
import { AccountPage } from './AccountPage';
import { PlansPage } from './PlansPage';
import { SecurityPage } from './SecurityPage';

const BillingPage = lazy(() =>
  import(/* webpackChunkName: "up-billing-page"*/ './BillingPage').then(module => ({
    default: module.BillingPage,
  })),
);

const ApiKeysPage = lazy(() =>
  import(/* webpackChunkName: "up-api-keys-page"*/ './ApiKeysPage').then(module => ({
    default: module.ApiKeysPage,
  })),
);

export const UserProfileRoutes = () => {
  const { pages } = useUserProfileContext();
  const { commerceSettings } = useEnvironment();

  const isAccountPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT;
  const isSecurityPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.SECURITY;
  const isBillingPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.BILLING;
  const isApiKeysPageRoot = pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.API_KEYS;

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
        {commerceSettings.billing.enabled && commerceSettings.billing.hasPaidUserPlans && (
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
              <Route path='statement/:statementId'>
                {/* TODO(@commerce): Should this be lazy loaded ? */}
                <Suspense fallback={''}>
                  <StatementPage />
                </Suspense>
              </Route>
            </Switch>
          </Route>
        )}
        <Route path={isApiKeysPageRoot ? undefined : 'api-keys'}>
          <Switch>
            <Route index>
              <ApiKeysPage />
            </Route>
          </Switch>
        </Route>
      </Route>
    </Switch>
  );
};
