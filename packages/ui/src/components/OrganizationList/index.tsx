import { withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';
import { OrganizationListPage } from './OrganizationListPage';

const OrganizationListInternal = () => {
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

const AuthenticatedRoutes = withCoreUserGuard(OrganizationListPage);

export const OrganizationList = OrganizationListInternal;
