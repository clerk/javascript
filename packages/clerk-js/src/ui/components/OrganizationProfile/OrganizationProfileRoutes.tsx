import { ProfileCardContent } from '../../elements';
import { Route, Switch } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
import { DeleteOrganizationPage, LeaveOrganizationPage } from './ActionConfirmationPage';
import { AddDomainPage } from './AddDomainPage';
import { InviteMembersPage } from './InviteMembersPage';
import { OrganizationMembers } from './OrganizationMembers';
import { OrganizationSettings } from './OrganizationSettings';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { VerifiedDomainPage } from './VerifiedDomainPage';
import { VerifyDomainPage } from './VerifyDomainPage';

export const OrganizationProfileRoutes = (props: PropsOfComponent<typeof ProfileCardContent>) => {
  return (
    <ProfileCardContent contentRef={props.contentRef}>
      <Route path='organization-settings'>
        <Switch>
          <Route
            path='profile'
            flowStart
          >
            <ProfileSettingsPage />
          </Route>
          <Route
            path='domain'
            flowStart
          >
            <Switch>
              <Route path=':id/verify'>
                <VerifyDomainPage />
              </Route>
              <Route path=':id'>
                <VerifiedDomainPage />
              </Route>
              <Route index>
                <AddDomainPage />
              </Route>
            </Switch>
          </Route>
          {/*<Route*/}
          {/*  path='add-domain'*/}
          {/*  flowStart*/}
          {/*>*/}
          {/*  <AddDomainPage />*/}
          {/*</Route>*/}
          {/*<Route*/}
          {/*  path='verify-domain/:id'*/}
          {/*  flowStart*/}
          {/*>*/}
          {/*  <VerifyDomainPage />*/}
          {/*</Route>*/}

          {/*<Route path='verified-domain/:id'>*/}
          {/*  <VerifiedDomainPage />*/}
          {/*</Route>*/}
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
            <DeleteOrganizationPage />
          </Route>
          <Route index>
            <OrganizationSettings />
          </Route>
        </Switch>
      </Route>
      <Route>
        <Switch>
          <Route
            path='invite-members'
            flowStart
          >
            <InviteMembersPage />
          </Route>
          <Route index>
            <OrganizationMembers />
          </Route>
        </Switch>
      </Route>
    </ProfileCardContent>
  );
};
