import { lazy, Suspense } from 'react';

import { Protect } from '../../common';
import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { useOptions, useOrganizationProfileContext } from '../../contexts';
import { Route, Switch } from '../../router';
import { OrganizationGeneralPage } from './OrganizationGeneralPage';
import { OrganizationMembers } from './OrganizationMembers';

const OrganizationBillingPage = lazy(() =>
  import(/* webpackChunkName: "op-billing-page"*/ './OrganizationBillingPage').then(module => ({
    default: module.OrganizationBillingPage,
  })),
);

export const OrganizationProfileRoutes = () => {
  const { pages, isMembersPageRoot, isGeneralPageRoot, isBillingPageRoot } = useOrganizationProfileContext();
  const { experimental } = useOptions();

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
        {experimental?.commerce && (
          <Route path={isBillingPageRoot ? undefined : 'organization-billing'}>
            <Switch>
              <Route index>
                <Suspense fallback={''}>
                  <OrganizationBillingPage />
                </Suspense>
              </Route>
            </Switch>
          </Route>
        )}
      </Route>
    </Switch>
  );
};
