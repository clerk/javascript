import { useOrganizationList } from '@clerk/shared/react';
import { useState } from 'react';

import { useEnvironment, useOrganizationListContext } from '../../contexts';
import { Box, Col, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import { Action, Card, Header, SecondaryActions, useCardState, withCardStateProvider } from '../../elements';
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
  const environment = useEnvironment();
  const { navigateAfterSelectOrganization, skipInvitationScreen } = useOrganizationListContext();
  const [isCreateOrganizationFlow, setCreateOrganizationFlow] = useState(!showListInitially);
  return (
    <>
      {!isCreateOrganizationFlow && (
        <OrganizationListPageList onCreateOrganizationClick={() => setCreateOrganizationFlow(true)} />
      )}

      {isCreateOrganizationFlow && (
        <Box
          sx={t => ({
            padding: `${t.space.$8}`,
          })}
        >
          <CreateOrganizationForm
            flow='organizationList'
            skipInvitationScreen={skipInvitationScreen}
            startPage={{
              headerTitle: localizationKeys('createOrganization.title'),
              headerSubtitle: localizationKeys('organizationList.subtitle', {
                applicationName: environment.displayConfig.applicationName,
              }),
            }}
            navigateAfterCreateOrganization={org =>
              navigateAfterSelectOrganization(org).then(() => setCreateOrganizationFlow(false))
            }
            onCancel={
              showListInitially && isCreateOrganizationFlow ? () => setCreateOrganizationFlow(false) : undefined
            }
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

  const handleCreateOrganizationClicked = () => {
    props.onCreateOrganizationClick();
  };
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
      <Col
        elementDescriptor={descriptors.main}
        sx={t => ({ borderTop: `${t.borders.$normal} ${t.colors.$blackAlpha100}` })}
      >
        <PreviewListItems>
          <SecondaryActions role='menu'>
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
              (userInvitations.count || 0) > 0 &&
              userInvitations.data?.map(inv => {
                return (
                  <InvitationPreview
                    key={inv.id}
                    {...inv}
                  />
                );
              })}

            {!userMemberships.hasNextPage &&
              !userInvitations.hasNextPage &&
              (userSuggestions.count || 0) > 0 &&
              userSuggestions.data?.map(inv => {
                return (
                  <SuggestionPreview
                    key={inv.id}
                    {...inv}
                  />
                );
              })}

            {(hasNextPage || isLoading) && <PreviewListSpinner ref={ref} />}
          </SecondaryActions>
        </PreviewListItems>

        <Action
          elementDescriptor={descriptors.organizationListCreateOrganizationActionButton}
          icon={Add}
          label={localizationKeys('organizationList.action__createOrganization')}
          onClick={handleCreateOrganizationClicked}
          sx={{ borderBottom: 'none' }}
          iconSx={t => ({
            width: t.sizes.$9,
            height: t.sizes.$6,
          })}
        />
      </Col>
    </>
  );
};
