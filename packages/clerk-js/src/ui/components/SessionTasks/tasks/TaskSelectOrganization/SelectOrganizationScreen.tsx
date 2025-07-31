import { useClerk, useOrganizationList, useUser } from '@clerk/shared/react';
import type {
  OrganizationResource,
  OrganizationSuggestionResource,
  UserOrganizationInvitationResource,
} from '@clerk/types';
import React, { useState } from 'react';

import {
  OrganizationPreviewListItem,
  OrganizationPreviewListItemButton,
} from '@/ui/common/organizations/OrganizationPreview';
import { organizationListParams, populateCacheUpdateItem } from '@/ui/components/OrganizationSwitcher/utils';
import { useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import { Col, descriptors, localizationKeys } from '@/ui/customizables';
import { Action, Actions } from '@/ui/elements/Actions';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { Add } from '@/ui/icons';
import { handleError } from '@/ui/utils/errorHandler';

import { Text } from '../../../customizables';
import { useOrganizationListInView } from '../../../OrganizationList/OrganizationListPage';
import {
  OrganizationListPreviewButton,
  PreviewListItem,
  PreviewListItems,
  PreviewListSpinner,
  sharedMainIdentifierSx,
} from '../../../OrganizationList/shared';

type SelectOrganizationScreenProps = {
  onCreateOrganizationClick: () => void;
};

export const SelectOrganizationScreen = withCardStateProvider(
  ({ onCreateOrganizationClick }: SelectOrganizationScreenProps) => {
    const { ref, userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();

    const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
    const hasNextPage = userMemberships?.hasNextPage || userInvitations?.hasNextPage || userSuggestions?.hasNextPage;

    // Filter out falsy values that can occur when SWR infinite loading resolves pages out of order
    // This happens when concurrent requests resolve in unexpected order, leaving undefined/null items in the data array
    const userInvitationsData = userInvitations.data?.filter(a => !!a);
    const userSuggestionsData = userSuggestions.data?.filter(a => !!a);

    // TODO -> Set organization as active
    return (
      <Col elementDescriptor={descriptors.main}>
        <PreviewListItems>
          <Actions role='menu'>
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
    );
  },
);

const MembershipPreview = withCardStateProvider((props: { organization: OrganizationResource }) => {
  const card = useCardState();
  const { redirectUrlComplete } = useSessionTasksContext();
  const { __internal_navigateToTaskIfAvailable } = useClerk();
  const { isLoaded, setActive } = useOrganizationList();

  if (!isLoaded) {
    return null;
  }

  const handleOrganizationClicked = (organization: OrganizationResource) => {
    return card.runAsync(async () => {
      await setActive({
        organization,
      });

      await __internal_navigateToTaskIfAvailable({ redirectUrlComplete });
    });
  };

  return (
    <OrganizationListPreviewButton onClick={() => handleOrganizationClicked(props.organization)}>
      <OrganizationPreview
        elementId='taskSelectOrganization'
        mainIdentifierSx={sharedMainIdentifierSx}
        organization={props.organization}
      />
    </OrganizationListPreviewButton>
  );
});

const InvitationPreview = withCardStateProvider((props: UserOrganizationInvitationResource) => {
  const card = useCardState();
  const { getOrganization } = useClerk();
  const [acceptedOrganization, setAcceptedOrganization] = useState<OrganizationResource | null>(null);
  const { userInvitations } = useOrganizationList({
    userInvitations: organizationListParams.userInvitations,
    userMemberships: organizationListParams.userMemberships,
  });

  const handleAccept = () => {
    return (
      card
        // When accepting an invitation we don't want to trigger a revalidation as this will cause a layout shift, prefer updating in place
        .runAsync(async () => {
          const updatedItem = await props.accept();
          const organization = await getOrganization(props.publicOrganizationData.id);
          return [updatedItem, organization] as const;
        })
        .then(([updatedItem, organization]) => {
          // Update cache in case another listener depends on it
          void userInvitations?.setData?.(cachedPages => populateCacheUpdateItem(updatedItem, cachedPages, 'negative'));
          setAcceptedOrganization(organization);
        })
        .catch(err => handleError(err, [], card.setError))
    );
  };

  if (acceptedOrganization) {
    return <MembershipPreview organization={acceptedOrganization} />;
  }

  return (
    <OrganizationPreviewListItem
      organizationData={props.publicOrganizationData}
      elementId='taskSelectOrganization'
    >
      <OrganizationPreviewListItemButton
        isLoading={card.isLoading}
        onClick={handleAccept}
        localizationKey={localizationKeys('organizationList.action__invitationAccept')}
      />
    </OrganizationPreviewListItem>
  );
});

const SuggestionPreview = withCardStateProvider((props: OrganizationSuggestionResource) => {
  const card = useCardState();
  const { userSuggestions } = useOrganizationList({
    userSuggestions: organizationListParams.userSuggestions,
  });

  const handleAccept = () => {
    return (
      card
        // When accepting a suggestion, a membership is not getting generated, so we don't need to revalidate memberships, only update suggestions in place
        .runAsync(props.accept)
        .then(updatedItem => userSuggestions?.setData?.(pages => populateCacheUpdateItem(updatedItem, pages)))
        .catch(err => handleError(err, [], card.setError))
    );
  };

  if (props.status === 'accepted') {
    return (
      <Text
        colorScheme='secondary'
        localizationKey={localizationKeys('organizationList.suggestionsAcceptedLabel')}
      />
    );
  }

  return (
    <PreviewListItem organizationData={props.publicOrganizationData}>
      <OrganizationPreviewListItemButton
        onClick={handleAccept}
        isLoading={card.isLoading}
        localizationKey={localizationKeys('organizationList.action__suggestionsAccept')}
      />
    </PreviewListItem>
  );
});

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
      elementDescriptor={descriptors.taskSelectOrganizationCreateOrganizationActionButton}
      icon={Add}
      label={localizationKeys('taskSelectOrganization.organizationListScreen.action__createOrganization')}
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
