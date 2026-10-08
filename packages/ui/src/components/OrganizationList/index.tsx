import { withCoreUserGuard } from '../../contexts';
import { OrganizationListRootView } from './organization-list.view';
import { OrganizationListPage } from './OrganizationListPage';

const OrganizationListInternal = () => {
  return (
    <OrganizationListRootView>
      <AuthenticatedRoutes />
    </OrganizationListRootView>
  );
};

const AuthenticatedRoutes = withCoreUserGuard(OrganizationListPage);

export const OrganizationList = OrganizationListInternal;
