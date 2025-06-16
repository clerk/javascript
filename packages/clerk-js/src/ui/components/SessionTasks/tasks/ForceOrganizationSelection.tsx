import { useOrganizationList } from '@clerk/shared/react/index';
import type { ComponentType, PropsWithChildren } from 'react';
import { useContext, useState } from 'react';

import { OrganizationListContext, useOrganizationListContext } from '@/ui/contexts';
import { SessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import { Card } from '@/ui/elements/Card';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { descriptors, Flex, localizationKeys, Spinner } from '../../../customizables';
import { CreateOrganizationForm } from '../../CreateOrganization/CreateOrganizationForm';
import { OrganizationListPageList } from '../../OrganizationList/OrganizationListPage';
import { organizationListParams } from '../../OrganizationSwitcher/utils';

function ForceOrganizationSelectionFlows() {
  const sessionTasksContext = useContext(SessionTasksContext);
  const { userMemberships, userInvitations, userSuggestions } = useOrganizationList(organizationListParams);
  const { navigateAfterCreateOrganization, hideSlug } = useOrganizationListContext();

  const isLoadingResources = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasData = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);

  const [isCreateOrganizationFlow, setIsCreateOrganizationFlow] = useState(false);
  const [isNavigatingAfterOrgCreation, setIsNavigatingAfterOrgCreation] = useState(false);

  const CreateOrganizationFlow = (
    <CreateOrganizationForm
      flow='organizationList'
      onComplete={sessionTasksContext?.nextTask}
      startPage={{ headerTitle: localizationKeys('organizationList.createOrganization') }}
      skipInvitationScreen
      navigateAfterCreateOrganization={org => {
        // During a force organization selection flow, keep displaying the creation form in a loading state.
        // This allows the client-side navigation to complete before transitioning away from this view.
        setIsNavigatingAfterOrgCreation(true);
        return navigateAfterCreateOrganization(org);
      }}
      onCancel={isCreateOrganizationFlow && hasData ? () => setIsCreateOrganizationFlow(false) : undefined}
      hideSlug={hideSlug}
    />
  );

  const isLoading = isNavigatingAfterOrgCreation || isLoadingResources;
  if (isLoading) {
    return (
      <FlowCard>
        <FlowLoadingState />
      </FlowCard>
    );
  }

  if (!hasData) {
    return <FlowCard>{CreateOrganizationFlow}</FlowCard>;
  }

  return (
    <FlowCard>
      {isCreateOrganizationFlow ? (
        <>{CreateOrganizationFlow}</>
      ) : (
        <OrganizationListPageList onCreateOrganizationClick={() => setIsCreateOrganizationFlow(true)} />
      )}
    </FlowCard>
  );
}

const FlowCard = ({ children }: PropsWithChildren) => {
  const card = useCardState();

  return (
    <Card.Root>
      <Card.Content>
        <Card.Alert>{card.error}</Card.Alert>
        {children}
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};

const FlowLoadingState = () => (
  <Flex
    direction='row'
    center
  >
    <Spinner
      size='xl'
      colorScheme='primary'
      elementDescriptor={descriptors.spinner}
    />
  </Flex>
);

const withOrganizationListContext = <P extends object>(WrappedComponent: ComponentType<P>) => {
  return (props: P) => (
    <OrganizationListContext.Provider
      value={{
        componentName: 'OrganizationList',
        skipInvitationScreen: true,
      }}
    >
      <WrappedComponent {...props} />
    </OrganizationListContext.Provider>
  );
};

/**
 * Renders the force organization selection flow as part of session tasks
 * @internal
 */
export const ForceOrganizationSelectionTask = withCardStateProvider(
  withOrganizationListContext(ForceOrganizationSelectionFlows),
);
