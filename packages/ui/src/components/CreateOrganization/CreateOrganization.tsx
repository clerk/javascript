import type { CreateOrganizationModalProps } from '@clerk/shared/types';

import { withCardStateProvider } from '@/ui/elements/contexts';

import { CreateOrganizationContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';
import type { CreateOrganizationCtx } from '../../types';
import { CreateOrganizationPage } from './CreateOrganizationPage';

const CreateOrganizationInternal = () => {
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
  return <CreateOrganizationPage />;
});

export const CreateOrganization = withCardStateProvider(CreateOrganizationInternal);

export const CreateOrganizationModal = (props: CreateOrganizationModalProps): JSX.Element => {
  const createOrganizationProps: CreateOrganizationCtx = {
    ...props,
    routing: 'virtual',
    componentName: 'CreateOrganization',
    mode: 'modal',
  };

  return (
    <Route path='createOrganization'>
      <CreateOrganizationContext.Provider value={createOrganizationProps}>
        <div>
          <CreateOrganization />
        </div>
      </CreateOrganizationContext.Provider>
    </Route>
  );
};
