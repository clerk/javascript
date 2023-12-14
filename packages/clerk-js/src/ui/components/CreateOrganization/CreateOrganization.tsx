import type { CreateOrganizationModalProps } from '@clerk/types';

import { withOrganizationsEnabledGuard } from '../../common';
import { ComponentContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { ProfileCard, withCardStateProvider } from '../../elements';
import { Route, Switch } from '../../router';
import type { CreateOrganizationCtx } from '../../types';
import { CreateOrganizationPage } from './CreateOrganizationPage';

const _CreateOrganization = () => {
  return (
    <Flow.Root flow='createOrganization'>
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

const AuthenticatedRoutes = withCoreUserGuard(() => {
  return (
    <ProfileCard.Root sx={t => ({ width: t.sizes.$120 })}>
      <ProfileCard.Content>
        <CreateOrganizationPage />
      </ProfileCard.Content>
    </ProfileCard.Root>
  );
});

export const CreateOrganization = withOrganizationsEnabledGuard(
  withCardStateProvider(_CreateOrganization),
  'CreateOrganization',
  { mode: 'redirect' },
);

export const CreateOrganizationModal = (props: CreateOrganizationModalProps): JSX.Element => {
  const createOrganizationProps: CreateOrganizationCtx = {
    ...props,
    routing: 'virtual',
    componentName: 'CreateOrganization',
    mode: 'modal',
  };

  return (
    <Route path='createOrganization'>
      <ComponentContext.Provider value={createOrganizationProps}>
        <div>
          <CreateOrganization />
        </div>
      </ComponentContext.Provider>
    </Route>
  );
};
