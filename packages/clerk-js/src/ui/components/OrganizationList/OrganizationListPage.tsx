import { useOrganizationList, useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { useEnvironment, useOrganizationListContext } from '../../contexts';
import { Box, Col, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import { Action, Actions, Card, Header, useCardState, withCardStateProvider } from '../../elements';
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
  const card = useCardState();
  const { userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();
  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasAnyData = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);

  const { hidePersonal } = useOrganizationListContext();

  return (
    <Card.Root>
      <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}` })}>
        <Card.Alert sx={t => ({ margin: `${t.space.$none} ${t.space.$5}` })}>{card.error}</Card.Alert>
        {isLoading && (
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
        )}

        {!isLoading && <OrganizationListFlows showListInitially={!(hidePersonal && !hasAnyData)} />}
      </Card.Content>
      <Card.Footer />
    </Card.Root>
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

  const { ref, userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();
  const { hidePersonal } = useOrganizationListContext();

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
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
