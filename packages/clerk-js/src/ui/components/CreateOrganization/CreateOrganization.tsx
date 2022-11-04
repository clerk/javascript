import { CreateOrganizationProps } from '@clerk/types';
import React from 'react';

import { withOrganizationsEnabledGuard } from '../../common';
import { ComponentContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { ProfileCard, ProfileCardContent, withCardStateProvider } from '../../elements';
import { Route, Switch } from '../../router';
import { CreateOrganizationCtx } from '../../types';
import { CreateOrganizationPage } from './CreateOrganizationPage';

const _CreateOrganization = (_: CreateOrganizationProps) => {
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
    <ProfileCard>
      <ProfileCardContent>
        <CreateOrganizationPage />
      </ProfileCardContent>
    </ProfileCard>
  );
});

export const CreateOrganization = withOrganizationsEnabledGuard(
  withCardStateProvider(_CreateOrganization),
  'CreateOrganization',
  { mode: 'redirect' },
);

export const CreateOrganizationModal = (props: CreateOrganizationProps): JSX.Element => {
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
          <CreateOrganization {...createOrganizationProps} />
        </div>
      </ComponentContext.Provider>
    </Route>
  );
};
