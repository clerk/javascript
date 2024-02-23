import { withOrganizationsEnabledGuard } from '../../common';
import { withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Animated, Card } from '../../elements';
import { Route, Switch } from '../../router';
import { OrganizationListPage } from './OrganizationListPage';

const _OrganizationList = () => {
  return (
    <Flow.Root flow='organizationList'>
      <Animated asChild>
        <Card.Root>
          <Switch>
            <Route>
              <AuthenticatedRoutes />
            </Route>
          </Switch>
        </Card.Root>
      </Animated>
    </Flow.Root>
  );
};

const AuthenticatedRoutes = withCoreUserGuard(OrganizationListPage);

export const OrganizationList = withOrganizationsEnabledGuard(_OrganizationList, 'OrganizationList', {
  mode: 'redirect',
});
