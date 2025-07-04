import { useOrganizationList } from '@clerk/shared/react/index';
import type { PropsWithChildren } from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { OrganizationListContext } from '@/ui/contexts';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { Box, descriptors, Flex, localizationKeys, Spinner } from '../../../customizables';
import { CreateOrganizationForm } from '../../CreateOrganization/CreateOrganizationForm';
import { OrganizationListPageList } from '../../OrganizationList/OrganizationListPage';
import { organizationListParams } from '../../OrganizationSwitcher/utils';

/**
 * @internal
 */
export const ForceOrganizationSelectionTask = withCardStateProvider(() => {
  const { userMemberships, userInvitations, userSuggestions } = useOrganizationList(organizationListParams);
  const currentFlow = useRef<'create-organization' | 'organization-selection'>();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const preservedHeightRef = useRef<number | null>(null);

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasData = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);

  // Capture height before switching to loading state
  useEffect(() => {
    if (!isLoading && contentRef.current) {
      preservedHeightRef.current = contentRef.current.offsetHeight;
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <FlowCard>
        <FlowLoadingState preservedHeight={preservedHeightRef.current} />
      </FlowCard>
    );
  }

  // Only show the organization selection page if organizations exist when the component first mounts.
  // This prevents unwanted screen transitions that could occur from data revalidation,
  // such as when a user accepts an organization invitation and the membership list updates.
  if (hasData || currentFlow.current === 'organization-selection') {
    return (
      <FlowCard ref={contentRef}>
        <OrganizationSelectionPage currentFlow={currentFlow} />
      </FlowCard>
    );
  }

  return (
    <FlowCard ref={contentRef}>
      <CreateOrganizationPage currentFlow={currentFlow} />
    </FlowCard>
  );
});

type CommonPageProps = {
  currentFlow: React.MutableRefObject<'create-organization' | 'organization-selection' | undefined>;
};

const OrganizationSelectionPage = ({ currentFlow }: CommonPageProps) => {
  const [showCreateOrganizationForm, setShowCreateOrganizationForm] = useState(false);

  useEffect(() => {
    currentFlow.current = 'organization-selection';
  }, [currentFlow]);

  return (
    <OrganizationListContext.Provider
      value={{
        componentName: 'OrganizationList',
        skipInvitationScreen: true,
      }}
    >
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
    </OrganizationListContext.Provider>
  );
};

const CreateOrganizationPage = ({ currentFlow }: CommonPageProps) => {
  useEffect(() => {
    currentFlow.current = 'create-organization';
  }, [currentFlow]);

  return (
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
  );
};

const FlowCard = forwardRef<HTMLDivElement, PropsWithChildren>(({ children }, ref) => {
  const card = useCardState();

  return (
    <Card.Root>
      <Card.Content
        ref={ref}
        sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}` })}
      >
        <Card.Alert sx={t => ({ margin: `${t.space.$none} ${t.space.$5}` })}>{card.error}</Card.Alert>
        {children}
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
});

const FlowLoadingState = ({ preservedHeight }: { preservedHeight: number | null }) => (
  <Flex
    direction='row'
    center
    sx={t => ({
      height: preservedHeight ? `${preservedHeight}px` : '100%',
      minHeight: preservedHeight ? `${preservedHeight}px` : t.sizes.$60,
    })}
  >
    <Spinner
      size='xl'
      colorScheme='primary'
      elementDescriptor={descriptors.spinner}
    />
  </Flex>
);
