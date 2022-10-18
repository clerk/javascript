import { ProfileCardContent } from '../../elements';
import { Route, Switch } from '../../router';
import { PropsOfComponent } from '../../styledSystem';
import { InviteMemberPage } from './InviteMemberPage';
import { OrganizationMembers } from './OrganizationMembers';
import { OrganizationSettings } from './OrganizationSettings';
import { ProfileSettingsPage } from './ProfileSettingsPage';

export const OrganizationProfileRoutes = (props: PropsOfComponent<typeof ProfileCardContent>) => {
  return (
    <ProfileCardContent contentRef={props.contentRef}>
      <Route path='organization-settings'>
        <Switch>
          <Route path='profile'>
            <ProfileSettingsPage />
          </Route>
          <Route index>
            <OrganizationSettings />
          </Route>
        </Switch>
      </Route>
      <Route>
        <Switch>
          <Route path='invite-members'>
            <InviteMemberPage />
          </Route>
          <Route index>
            <OrganizationMembers />
          </Route>
        </Switch>
      </Route>
    </ProfileCardContent>
  );
};
