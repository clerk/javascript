import { useOrganizationList, useUser } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import { useContext, useState } from 'react';

import { Action, Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

import { useEnvironment, useOrganizationListContext } from '../../contexts';
import { SessionTasksContext } from '../../contexts/components/SessionTasks';
import { Box, Col, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import { useInView } from '../../hooks';
import { Add } from '../../icons';
import { CreateOrganizationForm } from '../CreateOrganization/CreateOrganizationForm';
import { PreviewListItems, PreviewListSpinner } from './shared';
import { InvitationPreview } from './UserInvitationList';
import { MembershipPreview, PersonalAccountPreview } from './UserMembershipList';
import { SuggestionPreview } from './UserSuggestionList';
import { organizationListParams } from './utils';

const useOrganizationListInView = () => {
  const { userMemberships, userInvitations, userSuggestions } = useOrganizationList(organizationListParams);
  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (!inView) {
        return;
      }
      if (userMemberships.hasNextPage) {
        userMemberships.fetchNext?.();
      } else if (userInvitations.hasNextPage) {
        userInvitations.fetchNext?.();
      } else {
        userSuggestions.fetchNext?.();
      }
    },
  });

  return {
    isLoading,
    userMemberships,
    userInvitations,
    userSuggestions,
    ref,
  };
};

const CreateOrganizationButton = ({
  onCreateOrganizationClick,
}: {
  onCreateOrganizationClick: React.MouseEventHandler;
}) => {
  const { user } = useUser();

  if (!user?.createOrganizationEnabled) {
    return null;
  }

  return (
    <Action
      elementDescriptor={descriptors.organizationListCreateOrganizationActionButton}
      icon={Add}
      label={localizationKeys('organizationList.action__createOrganization')}
      onClick={onCreateOrganizationClick}
      sx={t => ({
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$neutralAlpha100,
        padding: `${t.space.$5} ${t.space.$5}`,
      })}
      iconSx={t => ({
        width: t.sizes.$9,
        height: t.sizes.$6,
      })}
    />
  );
};

export const OrganizationListPage = withCardStateProvider(() => {
  const { isLoading, userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();
  const { hidePersonal } = useOrganizationListContext();
  const hasOrganizationResources = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);

  const sessionTasksContext = useContext(SessionTasksContext);
  if (sessionTasksContext) {
    return <ForceOrganizationSelectionFlow hasOrganizationResources={hasOrganizationResources} />;
  }

  return (
    <FlowCard>
      {isLoading ? (
        <FlowLoadingState />
      ) : (
        <OrganizationListFlows showListInitially={!hidePersonal || hasOrganizationResources} />
      )}
    </FlowCard>
  );
});

const OrganizationListFlows = ({ showListInitially }: { showListInitially: boolean }) => {
  const { navigateAfterCreateOrganization, skipInvitationScreen, hideSlug } = useOrganizationListContext();
  const [isCreateOrganizationFlow, setCreateOrganizationFlow] = useState(!showListInitially);

  return (
    <>
      {!isCreateOrganizationFlow && (
        <OrganizationListPageList onCreateOrganizationClick={() => setCreateOrganizationFlow(true)} />
      )}

      {isCreateOrganizationFlow && (
        <Box
          sx={t => ({
            padding: `${t.space.$none} ${t.space.$5} ${t.space.$5}`,
          })}
        >
          <CreateOrganizationForm
            flow='organizationList'
            startPage={{ headerTitle: localizationKeys('organizationList.createOrganization') }}
            skipInvitationScreen={skipInvitationScreen}
            navigateAfterCreateOrganization={org =>
              navigateAfterCreateOrganization(org).then(() => setCreateOrganizationFlow(false))
            }
            onCancel={
              showListInitially && isCreateOrganizationFlow ? () => setCreateOrganizationFlow(false) : undefined
            }
            hideSlug={hideSlug}
          />
        </Box>
      )}
    </>
  );
};

const OrganizationListPageList = (props: { onCreateOrganizationClick: () => void }) => {
  const environment = useEnvironment();

  const { ref, isLoading, userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();
  const { hidePersonal } = useOrganizationListContext();

  const hasNextPage = userMemberships?.hasNextPage || userInvitations?.hasNextPage || userSuggestions?.hasNextPage;

  const onCreateOrganizationClick = () => {
    props.onCreateOrganizationClick();
  };

  // Solve weird bug with swr while running unit tests
  const userInvitationsData = userInvitations.data?.filter(a => !!a);
  const userSuggestionsData = userSuggestions.data?.filter(a => !!a);

  return (
    <>
      <Header.Root
        sx={t => ({
          padding: `${t.space.$none} ${t.space.$8}`,
        })}
      >
        <Header.Title
          localizationKey={localizationKeys(
            !hidePersonal ? 'organizationList.title' : 'organizationList.titleWithoutPersonal',
          )}
        />
        <Header.Subtitle
          localizationKey={localizationKeys('organizationList.subtitle', {
            applicationName: environment.displayConfig.applicationName,
          })}
        />
      </Header.Root>
      <Col elementDescriptor={descriptors.main}>
        <PreviewListItems>
          <Actions role='menu'>
            <PersonalAccountPreview />
            {(userMemberships.count || 0) > 0 &&
              userMemberships.data?.map(inv => {
                return (
                  <MembershipPreview
                    key={inv.id}
                    {...inv}
                  />
                );
              })}

            {!userMemberships.hasNextPage &&
              userInvitationsData?.map(inv => {
                return (
                  <InvitationPreview
                    key={inv.id}
                    {...inv}
                  />
                );
              })}

            {!userMemberships.hasNextPage &&
              !userInvitations.hasNextPage &&
              userSuggestionsData?.map(inv => {
                return (
                  <SuggestionPreview
                    key={inv.id}
                    {...inv}
                  />
                );
              })}

            {(hasNextPage || isLoading) && <PreviewListSpinner ref={ref} />}

            <CreateOrganizationButton onCreateOrganizationClick={onCreateOrganizationClick} />
          </Actions>
        </PreviewListItems>
      </Col>
    </>
  );
};

const ForceOrganizationSelectionFlow = ({ hasOrganizationResources }: { hasOrganizationResources: boolean }) => {
  const sessionTasksContext = useContext(SessionTasksContext);
  const { navigateAfterCreateOrganization, hideSlug } = useOrganizationListContext();
  const { isLoading: isLoadingOrganizationResources } = useOrganizationListInView();

  const [isNavigatingAfterOrgCreation, setIsNavigatingAfterOrgCreation] = useState(false);
  const [isCreateOrganizationFlow, setIsCreateOrganizationFlow] = useState(() => !hasOrganizationResources);

  const isLoading = isNavigatingAfterOrgCreation || isLoadingOrganizationResources;
  if (isLoading) {
    return (
      <FlowCard>
        <FlowLoadingState />
      </FlowCard>
    );
  }

  return (
    <FlowCard>
      {isCreateOrganizationFlow ? (
        <Box
          sx={t => ({
            padding: `${t.space.$none} ${t.space.$5} ${t.space.$5}`,
          })}
        >
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
            onCancel={
              isCreateOrganizationFlow && hasOrganizationResources
                ? () => setIsCreateOrganizationFlow(false)
                : undefined
            }
            hideSlug={hideSlug}
          />
        </Box>
      ) : (
        <OrganizationListPageList onCreateOrganizationClick={() => setIsCreateOrganizationFlow(true)} />
      )}
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
    direction={'row'}
    align={'center'}
    justify={'center'}
    sx={t => ({
      height: '100%',
      minHeight: t.sizes.$60,
    })}
  >
    <Spinner
      size={'lg'}
      colorScheme={'primary'}
      elementDescriptor={descriptors.spinner}
    />
  </Flex>
);
