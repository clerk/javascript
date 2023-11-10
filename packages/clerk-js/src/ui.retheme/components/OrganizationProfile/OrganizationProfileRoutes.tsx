import { Gate } from '../../common';
import { CustomPageContentContainer } from '../../common/CustomPageContentContainer';
import { ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useOrganizationProfileContext } from '../../contexts';
import { ProfileCardContent } from '../../elements';
import { Route, Switch } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
import { DeleteOrganizationPage, LeaveOrganizationPage } from './ActionConfirmationPage';
import { AddDomainPage } from './AddDomainPage';
import { InviteMembersPage } from './InviteMembersPage';
import { OrganizationMembers } from './OrganizationMembers';
import { OrganizationSettings } from './OrganizationSettings';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { RemoveDomainPage } from './RemoveDomainPage';
import { VerifiedDomainPage } from './VerifiedDomainPage';
import { VerifyDomainPage } from './VerifyDomainPage';

export const OrganizationProfileRoutes = (props: PropsOfComponent<typeof ProfileCardContent>) => {
  const { pages } = useOrganizationProfileContext();
  const isMembersPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS;
  const isSettingsPageRoot = pages.routes[0].id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.SETTINGS;

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
    <ProfileCardContent contentRef={props.contentRef}>
      <Switch>
        {customPageRoutesWithContents}
        <Route>
          <Route path={isSettingsPageRoot ? undefined : 'organization-settings'}>
            <Switch>
              <Route
                path='profile'
                flowStart
              >
                <Gate
                  permission={'org:sys_profile:manage'}
                  redirectTo='../'
                >
                  <ProfileSettingsPage />
                </Gate>
              </Route>
              <Route
                path='domain'
                flowStart
              >
                <Switch>
                  <Route path=':id/verify'>
                    <Gate
                      permission={'org:sys_domains:manage'}
                      redirectTo='../../'
                    >
                      <VerifyDomainPage />
                    </Gate>
                  </Route>
                  <Route path=':id/remove'>
                    <Gate
                      permission={'org:sys_domains:delete'}
                      redirectTo='../../'
                    >
                      <RemoveDomainPage />
                    </Gate>
                  </Route>
                  <Route path=':id'>
                    <Gate
                      some={[{ permission: 'org:sys_domains:manage' }, { permission: 'org:sys_domains:delete' }]}
                      redirectTo='../../'
                    >
                      <VerifiedDomainPage />
                    </Gate>
                  </Route>
                  <Route index>
                    <Gate
                      permission={'org:sys_domains:manage'}
                      redirectTo='../'
                    >
                      <AddDomainPage />
                    </Gate>
                  </Route>
                </Switch>
              </Route>
              <Route
                path='leave'
                flowStart
              >
                <LeaveOrganizationPage />
              </Route>
              <Route
                path='delete'
                flowStart
              >
                <Gate
                  permission={'org:sys_profile:delete'}
                  redirectTo='../'
                >
                  <DeleteOrganizationPage />
                </Gate>
              </Route>
              <Route index>
                <OrganizationSettings />
              </Route>
            </Switch>
          </Route>
          <Route path={isMembersPageRoot ? undefined : 'organization-members'}>
            <Switch>
              <Route
                path='invite-members'
                flowStart
              >
                <Gate
                  permission={'org:sys_memberships:manage'}
                  redirectTo='../'
                >
                  <InviteMembersPage />
                </Gate>
              </Route>
              <Route index>
                <OrganizationMembers />
              </Route>
            </Switch>
          </Route>
        </Route>
      </Switch>
    </ProfileCardContent>
  );
};
