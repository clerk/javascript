import { useOrganizationList } from '@clerk/shared/react/index';
import type { PropsWithChildren } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';

import { OrganizationListContext } from '@/ui/contexts';
import { TaskSelectOrganizationContext, useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { Box, descriptors, Flex, Flow, localizationKeys, Spinner } from '../../../customizables';
import { CreateOrganizationForm } from '../../CreateOrganization/CreateOrganizationForm';
import { OrganizationListPageList } from '../../OrganizationList/OrganizationListPage';
import { organizationListParams } from '../../OrganizationSwitcher/utils';

export const TaskSelectOrganization = withCardStateProvider(() => {
  const { userMemberships, userInvitations, userSuggestions } = useOrganizationList(organizationListParams);
  const currentFlow = useRef<'create-organization' | 'organization-selection'>();

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasData = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);

  if (isLoading) {
    return (
      <FlowCard>
        <FlowLoadingState />
      </FlowCard>
    );
  }

  // Only show the organization selection page if organizations exist when the component first mounts.
  // This prevents unwanted screen transitions that could occur from data revalidation,
  // such as when a user accepts an organization invitation and the membership list updates.
  if (hasData || currentFlow.current === 'organization-selection') {
    return <OrganizationSelectionPage currentFlow={currentFlow} />;
  }

  return <CreateOrganizationPage currentFlow={currentFlow} />;
});

type CommonPageProps = {
  currentFlow: React.MutableRefObject<'create-organization' | 'organization-selection' | undefined>;
};

const OrganizationSelectionPage = ({ currentFlow }: CommonPageProps) => {
  const [showCreateOrganizationForm, setShowCreateOrganizationForm] = useState(false);
  const ctx = useContext(TaskSelectOrganizationContext);

  useEffect(() => {
    currentFlow.current = 'organization-selection';
  }, [currentFlow]);

  return (
    <OrganizationListContext.Provider
      value={{
        componentName: 'OrganizationList',
        skipInvitationScreen: true,
        appearance: ctx?.appearance,
      }}
    >
      <FlowCard>
        {showCreateOrganizationForm ? (
          <Box
            sx={t => ({
              padding: `${t.space.$none} ${t.space.$5} ${t.space.$5}`,
            })}
          >
            <CreateOrganizationForm
              flow='default'
              startPage={{ headerTitle: localizationKeys('organizationList.createOrganization') }}
              skipInvitationScreen
              onCancel={() => setShowCreateOrganizationForm(false)}
            />
          </Box>
        ) : (
          <OrganizationListPageList onCreateOrganizationClick={() => setShowCreateOrganizationForm(true)} />
        )}
      </FlowCard>
    </OrganizationListContext.Provider>
  );
};

const CreateOrganizationPage = ({ currentFlow }: CommonPageProps) => {
  useEffect(() => {
    currentFlow.current = 'create-organization';
  }, [currentFlow]);

  return (
    <FlowCard>
      <Box
        sx={t => ({
          padding: `${t.space.$none} ${t.space.$5} ${t.space.$5}`,
        })}
      >
        <CreateOrganizationForm
          flow='default'
          startPage={{ headerTitle: localizationKeys('organizationList.createOrganization') }}
          skipInvitationScreen
        />
      </Box>
    </FlowCard>
  );
};

const FlowCard = ({ children }: PropsWithChildren) => {
  const card = useCardState();
  const { currentTaskContainer } = useSessionTasksContext();

  return (
    <Flow.Root flow='taskSelectOrganization'>
      <Card.Root ref={currentTaskContainer}>
        <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}` })}>
          <Card.Alert sx={t => ({ margin: `${t.space.$none} ${t.space.$5}` })}>{card.error}</Card.Alert>
          {children}
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Root>
  );
};

const FlowLoadingState = () => (
  <Flex
    direction='row'
    center
    sx={t => ({
      height: '100%',
      minHeight: t.sizes.$60,
    })}
  >
    <Spinner
      size='xl'
      colorScheme='primary'
      elementDescriptor={descriptors.spinner}
    />
  </Flex>
);
