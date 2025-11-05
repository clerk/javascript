import type {
  __internal_EnableOrganizationsModalProps,
  __internal_EnableOrganizationsProps,
} from '@clerk/shared/types';
import React from 'react';

import { EnableOrganizationsContext } from '@/ui/contexts/components/EnableOrganizations';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

import { withCoreSessionSwitchGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';

const EnableOrganizationsContent = withCardStateProvider(() => (
  <Card.Root>
    <Card.Content>
      <Header.Root>
        <Header.Title>Enable organizations</Header.Title>
      </Header.Root>
    </Card.Content>
    <Card.Footer />
  </Card.Root>
));

function EnableOrganizationsRoutes(): JSX.Element {
  return (
    <Flow.Root flow='enableOrganizations'>
      <Switch>
        <Route index>
          <EnableOrganizationsContent />
        </Route>
      </Switch>
    </Flow.Root>
  );
}

EnableOrganizationsRoutes.displayName = 'EnableOrganizations';

const EnableOrganizations: React.ComponentType<__internal_EnableOrganizationsProps> =
  withCoreSessionSwitchGuard(EnableOrganizationsRoutes);

// TODO -> Maybe move this to a inner folder for all in-app modals
const EnableOrganizationsModal = (props: __internal_EnableOrganizationsModalProps): JSX.Element => {
  return (
    <Route path='enable-organizations'>
      <EnableOrganizationsContext.Provider
        value={{
          componentName: 'EnableOrganizations',
          routing: 'virtual',
          ...props,
        }}
      >
        <div>
          <EnableOrganizations routing='virtual' />
        </div>
      </EnableOrganizationsContext.Provider>
    </Route>
  );
};

export { EnableOrganizations, EnableOrganizationsModal };
