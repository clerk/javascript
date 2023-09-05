import { withOrganizationsEnabledGuard } from '../../common';
import { withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';

const _OrganizationList = () => {
  return (
    <Flow.Root flow='organizationList'>
      <Flow.Part>
        <Switch>
          <Route>
            <AuthenticatedRoutes />
          </Route>
        </Switch>
      </Flow.Part>
    </Flow.Root>
  );
};

const AuthenticatedRoutes = withCoreUserGuard(
  /**
   * TODO: Update this with the internal implementation
   */ () => null,
);

export const OrganizationList = withOrganizationsEnabledGuard(_OrganizationList, 'OrganizationList', {
  mode: 'redirect',
});
