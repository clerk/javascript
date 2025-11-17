import { lazy, Suspense } from 'react';

import { Protect } from '../../common';
import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Route, Switch } from '../../router';
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

export const OrganizationProfileRoutes = () => {
  const {
    pages,
    isMembersPageRoot,
    isGeneralPageRoot,
    isBillingPageRoot,
    isApiKeysPageRoot,
    shouldShowBilling,
    apiKeysProps,
  } = useOrganizationProfileContext();
  const { apiKeysSettings, commerceSettings } = useEnvironment();

  const customPageRoutesWithContents = pages.contents?.map((customPage, index) => {
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
              <Protect
                condition={has =>
                  has({ permission: 'org:sys_memberships:read' }) || has({ permission: 'org:sys_memberships:manage' })
                }
                redirectTo={isGeneralPageRoot ? '../' : './organization-general'}
              >
                <OrganizationMembers />
              </Protect>
            </Route>
          </Switch>
        </Route>
        {commerceSettings.billing.organization.enabled && shouldShowBilling ? (
          <Protect
            condition={has =>
              has({ permission: 'org:sys_billing:read' }) || has({ permission: 'org:sys_billing:manage' })
            }
          >
            <Route path={isBillingPageRoot ? undefined : 'organization-billing'}>
              <Switch>
                <Route index>
                  <Suspense fallback={''}>
                    <OrganizationBillingPage />
                  </Suspense>
                </Route>
                {commerceSettings.billing.organization.hasPaidPlans ? (
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
              </Switch>
            </Route>
          </Protect>
        ) : null}
        {apiKeysSettings.orgs_api_keys_enabled && !apiKeysProps?.hide && (
          <Protect
            condition={has =>
              has({ permission: 'org:sys_api_keys:read' }) || has({ permission: 'org:sys_api_keys:manage' })
            }
          >
            <Route path={isApiKeysPageRoot ? undefined : 'organization-api-keys'}>
              <Switch>
                <Route index>
                  <Suspense fallback={''}>
                    <OrganizationAPIKeysPage />
                  </Suspense>
                </Route>
              </Switch>
            </Route>
          </Protect>
        )}
      </Route>
    </Switch>
  );
};
