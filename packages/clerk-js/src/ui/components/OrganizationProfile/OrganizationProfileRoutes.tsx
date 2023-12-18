import { Gate } from '../../common';
import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useOrganizationProfileContext } from '../../contexts';
import { Route, Switch } from '../../router';
import { OrganizationGeneralPage } from './OrganizationGeneralPage';
import { OrganizationMembers } from './OrganizationMembers';

export const OrganizationProfileRoutes = () => {
  const { pages } = useOrganizationProfileContext();
  const isMembersPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS;
  const isSettingsPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.GENERAL;

  const customPageRoutesWithContents = pages.contents?.map((customPage, index) => {
    const shouldFirstCustomItemBeOnRoot = !isSettingsPageRoot && !isMembersPageRoot && index === 0;
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
        <Route path={isSettingsPageRoot ? undefined : 'organization-settings'}>
          <Switch>
            <Route index>
              <OrganizationGeneralPage />
            </Route>
          </Switch>
        </Route>
        <Route path={isMembersPageRoot ? undefined : 'organization-members'}>
          <Switch>
            <Route index>
              <Gate
                condition={has =>
                  has({ permission: 'org:sys_memberships:read' }) || has({ permission: 'org:sys_memberships:manage' })
                }
                redirectTo={isSettingsPageRoot ? '../' : './organization-settings'}
              >
                <OrganizationMembers />
              </Gate>
            </Route>
          </Switch>
        </Route>
      </Route>
    </Switch>
  );
};
