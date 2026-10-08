import type { ComponentType } from 'react';
import { lazy, Suspense } from 'react';

import { CustomPageContentContainer } from '@/ui/common/CustomPageContentContainer';
import { Route, Switch } from '@/ui/router';

import type { OrganizationProfileRoutesData } from './organization-navigation.types';
import type { OrganizationProfileRouteGuardProps } from './organization-profile-routes.guard';
import { OrganizationGeneralPage } from './OrganizationGeneralPage';
import { OrganizationMembers } from './OrganizationMembers';

const OrganizationBillingPage = lazy(() =>
  import(/* webpackChunkName: "op-billing-page"*/ './OrganizationBillingPage').then(module => ({
    default: module.OrganizationBillingPage,
  })),
);

const OrganizationAPIKeysPage = lazy(() =>
  import(/* webpackChunkName: "op-api-keys-page"*/ './OrganizationAPIKeysPage').then(module => ({
    default: module.OrganizationAPIKeysPage,
  })),
);

const OrganizationPlansPage = lazy(() =>
  import(/* webpackChunkName: "op-plans-page"*/ './OrganizationPlansPage').then(module => ({
    default: module.OrganizationPlansPage,
  })),
);

const OrganizationStatementPage = lazy(() =>
  import(/* webpackChunkName: "statement-page"*/ './OrganizationStatementPage').then(module => ({
    default: module.OrganizationStatementPage,
  })),
);

const OrganizationPaymentAttemptPage = lazy(() =>
  import(/* webpackChunkName: "payment-attempt-page"*/ './OrganizationPaymentAttemptPage').then(module => ({
    default: module.OrganizationPaymentAttemptPage,
  })),
);

const CreditHistoryPage = lazy(() =>
  import(/* webpackChunkName: "credit-history-page"*/ '../AccountCredits').then(module => ({
    default: module.CreditHistoryPage,
  })),
);

const OrganizationSecurityPage = lazy(() =>
  import(/* webpackChunkName: "op-security-page"*/ './OrganizationSecurityPage').then(module => ({
    default: module.OrganizationSecurityPage,
  })),
);

export const OrganizationProfileRoutesView = ({
  data,
  contentRef,
  Guard,
}: {
  data: OrganizationProfileRoutesData;
  contentRef: React.RefObject<HTMLDivElement>;
  Guard: ComponentType<OrganizationProfileRouteGuardProps>;
}) => {
  const {
    customPages,
    isGeneralPageRoot,
    isMembersPageRoot,
    isBillingPageRoot,
    isAPIKeysPageRoot,
    isSecurityPageRoot,
    showBilling,
    hasPaidPlans,
    showAPIKeys,
    showSecurity,
  } = data;

  const customPageRoutesWithContents = customPages?.map((customPage, index) => {
    const shouldFirstCustomItemBeOnRoot = !isGeneralPageRoot && !isMembersPageRoot && index === 0;
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
        <Route path={isGeneralPageRoot ? undefined : 'organization-general'}>
          <Switch>
            <Route index>
              <OrganizationGeneralPage />
            </Route>
          </Switch>
        </Route>
        <Route path={isMembersPageRoot ? undefined : 'organization-members'}>
          <Switch>
            <Route index>
              <Guard
                kind='members'
                redirectTo={isGeneralPageRoot ? '../' : './organization-general'}
              >
                <OrganizationMembers />
              </Guard>
            </Route>
          </Switch>
        </Route>
        {showBilling ? (
          <Guard kind='billing'>
            <Route path={isBillingPageRoot ? undefined : 'organization-billing'}>
              <Switch>
                <Route index>
                  <Suspense fallback={''}>
                    <OrganizationBillingPage />
                  </Suspense>
                </Route>
                {hasPaidPlans ? (
                  <Route path='plans'>
                    <Suspense fallback={''}>
                      <OrganizationPlansPage />
                    </Suspense>
                  </Route>
                ) : null}
                <Route path='statement/:statementId'>
                  <Suspense fallback={''}>
                    <OrganizationStatementPage />
                  </Suspense>
                </Route>
                <Route path='payment-attempt/:paymentAttemptId'>
                  <Suspense fallback={''}>
                    <OrganizationPaymentAttemptPage />
                  </Suspense>
                </Route>
                <Route path='credit-history'>
                  <Suspense fallback={''}>
                    <CreditHistoryPage />
                  </Suspense>
                </Route>
              </Switch>
            </Route>
          </Guard>
        ) : null}
        {showAPIKeys && (
          <Guard kind='apiKeys'>
            <Route path={isAPIKeysPageRoot ? undefined : 'organization-api-keys'}>
              <Switch>
                <Route index>
                  <Suspense fallback={''}>
                    <OrganizationAPIKeysPage />
                  </Suspense>
                </Route>
              </Switch>
            </Route>
          </Guard>
        )}
        {showSecurity ? (
          <Route path={isSecurityPageRoot ? undefined : 'organization-security'}>
            <Switch>
              <Route index>
                <Suspense fallback={''}>
                  <OrganizationSecurityPage contentRef={contentRef} />
                </Suspense>
              </Route>
            </Switch>
          </Route>
        ) : null}
      </Route>
    </Switch>
  );
};
