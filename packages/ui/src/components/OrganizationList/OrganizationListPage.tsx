import { useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { CreateOrganizationAction } from '@/common/CreateOrganizationAction';
import { OrganizationPreviewSpinner } from '@/ui/common/organizations/OrganizationPreview';
import { Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { useOrganizationListInView } from '@/ui/hooks/useOrganizationListInView';
import { filterExclusiveMemberships } from '@/ui/utils/filterExclusiveMemberships';

import { useEnvironment, useOrganizationListContext } from '../../contexts';
import { Box, Col, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
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
  return (
    <CreateOrganizationAction
      elementDescriptor={descriptors.organizationListCreateOrganizationActionButton}
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
      <Card.Content sx={t => ({ padding: `${t.space.$4} ${t.space.$none} ${t.space.$none}` })}>
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
  const { user } = useUser();

  // Derive `hasExclusive` from the full, non-paginated membership set on the User resource so it never
  // fails open when the exclusive membership is not on the currently loaded page of `userMemberships`.
  const { hasExclusive } = filterExclusiveMemberships(user?.organizationMemberships ?? []);

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  // When the user has an exclusive membership, invitations/suggestions are hidden and we never load
  // additional membership pages, so the spinner/observer must not keep paginating.
  const hasNextPage = hasExclusive
    ? false
    : userMemberships?.hasNextPage || userInvitations?.hasNextPage || userSuggestions?.hasNextPage;

  const onCreateOrganizationClick = () => {
    // Clear error originated from the list when switching to form
    card.setError(undefined);
    props.onCreateOrganizationClick();
  };

  // Filter out falsy values that can occur when infinite loading resolves pages out of order
  // This happens when concurrent requests resolve in unexpected order, leaving undefined/null items in the data array
  const userInvitationsData = userInvitations.data?.filter(a => !!a);
  const userSuggestionsData = userSuggestions.data?.filter(a => !!a);

  // The displayed list still filters the currently loaded page to exclusive-only when the user has an
  // exclusive membership, so a partially-loaded page can never surface a non-exclusive organization.
  const loadedMemberships = (userMemberships.count || 0) > 0 ? userMemberships.data || [] : [];
  const { memberships: visibleMemberships } = filterExclusiveMemberships(loadedMemberships);

  return (
    <>
      <Header.Root
        sx={t => ({
          padding: `${t.space.$4} ${t.space.$4} ${t.space.$none}`,
        })}
        showLogo
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
            <PersonalAccountPreview forceHide={hasExclusive} />
            {visibleMemberships.map(inv => {
              return (
                <MembershipPreview
                  key={inv.id}
                  {...inv}
                />
              );
            })}

            {/* When the user has an exclusive membership they must not see ways to join or create
                other organizations: invitations, suggestions, and the create button are all hidden. */}
            {!hasExclusive &&
              !userMemberships.hasNextPage &&
              userInvitationsData?.map(inv => {
                return (
                  <InvitationPreview
                    key={inv.id}
                    {...inv}
                  />
                );
              })}

            {!hasExclusive &&
              !userMemberships.hasNextPage &&
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

            {!hasExclusive && <CreateOrganizationButton onCreateOrganizationClick={onCreateOrganizationClick} />}
          </Actions>
        </PreviewListItems>
      </Col>
    </>
  );
};
