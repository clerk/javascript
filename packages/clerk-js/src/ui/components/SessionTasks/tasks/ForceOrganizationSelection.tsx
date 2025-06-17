import { useOrganizationList } from '@clerk/shared/react/index';
import type { ComponentProps, PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { OrganizationListContext } from '@/ui/contexts';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { Box, descriptors, Flex, localizationKeys, Spinner } from '../../../customizables';
import { CreateOrganizationForm } from '../../CreateOrganization/CreateOrganizationForm';
import { OrganizationListPageList } from '../../OrganizationList/OrganizationListPage';
import { organizationListParams } from '../../OrganizationSwitcher/utils';

const ForceOrganizationSelectionFlows = () => {
  const { isLoading, hasData, currentFlow, setCurrentFlow } = useForceOrganizationSelectionFlows();

  if (isLoading) {
    return (
      <FlowCard>
        <FlowLoadingState />
      </FlowCard>
    );
  }

  if (hasData && currentFlow !== 'create-organization') {
    return <OrganizationSelectionPage setCurrentFlow={setCurrentFlow} />;
  }

  return <CreateOrganizationPage setCurrentFlow={setCurrentFlow} />;
};

const OrganizationSelectionPage = ({ setCurrentFlow }: CommonPageProps) => {
  const [showCreateOrganizationForm, setShowCreateOrganizationForm] = useState(false);

  useEffect(() => {
    setCurrentFlow('organization-selection');
  }, [setCurrentFlow]);

  if (showCreateOrganizationForm) {
    return <CreateOrganizationPage setCurrentFlow={setCurrentFlow} />;
  }

  return (
    <OrganizationListContext.Provider
      value={{
        componentName: 'OrganizationList',
        skipInvitationScreen: true,
      }}
    >
      <FlowCard>
        <OrganizationListPageList onCreateOrganizationClick={() => setShowCreateOrganizationForm(true)} />
      </FlowCard>
    </OrganizationListContext.Provider>
  );
};

const CreateOrganizationPage = ({
  onCancel,
  setCurrentFlow,
}: CommonPageProps & Pick<ComponentProps<typeof CreateOrganizationForm>, 'onCancel'>) => {
  useEffect(() => {
    setCurrentFlow('create-organization');
  }, [setCurrentFlow]);

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
          onCancel={onCancel}
        />
      </Box>
    </FlowCard>
  );
};

const FlowCard = ({ children }: PropsWithChildren) => {
  const card = useCardState();

  return (
    <Card.Root>
      <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}` })}>
        <Card.Alert sx={t => ({ margin: `${t.space.$none} ${t.space.$5}` })}>{card.error}</Card.Alert>
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

type Flow = 'create-organization' | 'organization-selection';

type CommonPageProps = {
  setCurrentFlow: React.Dispatch<React.SetStateAction<Flow | undefined>>;
};

const useForceOrganizationSelectionFlows = () => {
  const [currentFlow, setCurrentFlow] = useState<Flow | undefined>();
  const { userMemberships, userInvitations, userSuggestions } = useOrganizationList(organizationListParams);

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasData = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);

  return {
    currentFlow,
    setCurrentFlow,
    hasData,
    isLoading,
  };
};

/**
 * @internal
 */
export const ForceOrganizationSelectionTask = withCardStateProvider(ForceOrganizationSelectionFlows);
