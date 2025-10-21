import { useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { OrganizationPreviewSpinner } from '@/ui/common/organizations/OrganizationPreview';
import { Action, Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { useOrganizationListInView } from '@/ui/hooks/useOrganizationListInView';

import { useEnvironment, useOrganizationListContext } from '../../contexts';
import { Box, Col, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import { Add } from '../../icons';
import { CreateOrganizationForm } from '../CreateOrganization/CreateOrganizationForm';
import { PreviewListItems } from './shared';
import { InvitationPreview } from './UserInvitationList';
import { MembershipPreview, PersonalAccountPreview } from './UserMembershipList';
import { SuggestionPreview } from './UserSuggestionList';

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
        borderTopColor: t.colors.$borderAlpha100,
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
  const { userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();
  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasAnyData = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);

  const { hidePersonal } = useOrganizationListContext();

  return (
    <Card.Root>
      <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}` })}>
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
  const card = useCardState();
  const { navigateAfterCreateOrganization, skipInvitationScreen } = useOrganizationListContext();
  const [isCreateOrganizationFlow, setCreateOrganizationFlow] = useState(!showListInitially);
  return (
    <>
      {!isCreateOrganizationFlow && (
        <OrganizationListPageList onCreateOrganizationClick={() => setCreateOrganizationFlow(true)} />
      )}

      {isCreateOrganizationFlow && (
        <>
          <Card.Alert sx={t => ({ margin: `${t.space.$none} ${t.space.$5}` })}>{card.error}</Card.Alert>

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
            />
          </Box>
        </>
      )}
    </>
  );
};

export const OrganizationListPageList = (props: { onCreateOrganizationClick: () => void }) => {
  const card = useCardState();
  const environment = useEnvironment();

  const { ref, userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();
  const { hidePersonal } = useOrganizationListContext();

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasNextPage = userMemberships?.hasNextPage || userInvitations?.hasNextPage || userSuggestions?.hasNextPage;

  const onCreateOrganizationClick = () => {
    // Clear error originated from the list when switching to form
    card.setError(undefined);
    props.onCreateOrganizationClick();
  };

  // Filter out falsy values that can occur when SWR infinite loading resolves pages out of order
  // This happens when concurrent requests resolve in unexpected order, leaving undefined/null items in the data array
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
      <Card.Alert sx={t => ({ margin: `${t.space.$none} ${t.space.$5}` })}>{card.error}</Card.Alert>
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

            {(hasNextPage || isLoading) && <OrganizationPreviewSpinner ref={ref} />}

            <CreateOrganizationButton onCreateOrganizationClick={onCreateOrganizationClick} />
          </Actions>
        </PreviewListItems>
      </Col>
    </>
  );
};
