import { useClerk, useOrganizationList, useUser } from '@clerk/shared/react';
import type {
  OrganizationResource,
  OrganizationSuggestionResource,
  UserOrganizationInvitationResource,
} from '@clerk/types';
import React, { useState } from 'react';

import {
  OrganizationPreviewButton,
  OrganizationPreviewListItem,
  OrganizationPreviewListItemButton,
  OrganizationPreviewListItems,
  OrganizationPreviewSpinner,
  sharedMainIdentifierSx,
} from '@/ui/common/organizations/OrganizationPreview';
import { organizationListParams, populateCacheUpdateItem } from '@/ui/components/OrganizationSwitcher/utils';
import { useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import { Col, descriptors, localizationKeys, Text } from '@/ui/customizables';
import { Action, Actions } from '@/ui/elements/Actions';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { useOrganizationListInView } from '@/ui/hooks/useOrganizationListInView';
import { Add } from '@/ui/icons';
import { handleError } from '@/ui/utils/errorHandler';

type ChooseOrganizationScreenProps = {
  onCreateOrganizationClick: () => void;
};

export const ChooseOrganizationScreen = withCardStateProvider(
  ({ onCreateOrganizationClick }: ChooseOrganizationScreenProps) => {
    const { ref, userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();

    const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
    const hasNextPage = userMemberships?.hasNextPage || userInvitations?.hasNextPage || userSuggestions?.hasNextPage;

    // Filter out falsy values that can occur when SWR infinite loading resolves pages out of order
    // This happens when concurrent requests resolve in unexpected order, leaving undefined/null items in the data array
    const userInvitationsData = userInvitations.data?.filter(a => !!a);
    const userSuggestionsData = userSuggestions.data?.filter(a => !!a);

    return (
      <>
        <Header.Root
          showLogo
          sx={t => ({ padding: `${t.space.$none} ${t.space.$8}` })}
        >
          <Header.Title localizationKey={localizationKeys('taskChooseOrganization.chooseOrganization.title')} />
          <Header.Subtitle localizationKey={localizationKeys('taskChooseOrganization.chooseOrganization.subtitle')} />
        </Header.Root>
        <Col elementDescriptor={descriptors.main}>
          <OrganizationPreviewListItems elementDescriptor={descriptors.taskChooseOrganizationPreviewItems}>
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

              {(hasNextPage || isLoading) && <OrganizationPreviewSpinner ref={ref} />}

              <CreateOrganizationButton onCreateOrganizationClick={onCreateOrganizationClick} />
            </Actions>
          </OrganizationPreviewListItems>
        </Col>
      </>
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
    <OrganizationPreviewButton
      elementDescriptor={descriptors.taskChooseOrganizationPreviewButton}
      onClick={() => handleOrganizationClicked(props.organization)}
    >
      <OrganizationPreview
        elementId='taskChooseOrganization'
        mainIdentifierSx={sharedMainIdentifierSx}
        organization={props.organization}
      />
    </OrganizationPreviewButton>
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
      elementId='taskChooseOrganization'
      elementDescriptor={descriptors.taskChooseOrganizationPreviewItem}
    >
      <OrganizationPreviewListItemButton
        isLoading={card.isLoading}
        onClick={handleAccept}
        localizationKey={localizationKeys('taskChooseOrganization.chooseOrganization.action__invitationAccept')}
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
        localizationKey={localizationKeys('taskChooseOrganization.chooseOrganization.suggestionsAcceptedLabel')}
      />
    );
  }

  return (
    <OrganizationPreviewListItem
      organizationData={props.publicOrganizationData}
      elementId='taskChooseOrganization'
      elementDescriptor={descriptors.taskChooseOrganizationPreviewItem}
    >
      <OrganizationPreviewListItemButton
        onClick={handleAccept}
        isLoading={card.isLoading}
        localizationKey={localizationKeys('taskChooseOrganization.chooseOrganization.action__suggestionsAccept')}
      />
    </OrganizationPreviewListItem>
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
      elementDescriptor={descriptors.taskChooseOrganizationCreateOrganizationActionButton}
      icon={Add}
      label={localizationKeys('taskChooseOrganization.chooseOrganization.action__createOrganization')}
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
