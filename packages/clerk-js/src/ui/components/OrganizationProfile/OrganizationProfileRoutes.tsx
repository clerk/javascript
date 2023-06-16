import { ProfileCardContent } from '../../elements';
import { Route, Switch } from '../../router';
import type { PropsOfComponent } from '../../styledSystem';
import { LeaveOrganizationPage, DeleteOrganizationPage } from './ActionConfirmationPage';
import { InviteMembersPage } from './InviteMembersPage';
import { OrganizationMembers } from './OrganizationMembers';
import { OrganizationSettings } from './OrganizationSettings';
import { ProfileSettingsPage } from './ProfileSettingsPage';

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
