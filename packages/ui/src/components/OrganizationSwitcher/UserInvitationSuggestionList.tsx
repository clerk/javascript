import { useClerk, useOrganization, useOrganizationList } from '@clerk/shared/react';
import type {
  OrganizationResource,
  OrganizationSuggestionResource,
  UserOrganizationInvitationResource,
} from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';

import { Actions } from '@/ui/elements/Actions';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PreviewButton } from '@/ui/elements/PreviewButton';
import { handleError } from '@/ui/utils/errorHandler';

import { InfiniteListSpinner } from '../../common';
import { useAcceptedInvitations } from '../../contexts';
import { Box, Button, descriptors, Flex, localizationKeys, Text } from '../../customizables';
import { useInView } from '../../hooks';
import { SwitchArrowRight } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { common } from '../../styledSystem';
import { organizationListParams, populateCacheUpdateItem } from './utils';

const useFetchInvitations = () => {
  const { userInvitations, userSuggestions } = useOrganizationList(organizationListParams);

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (!inView) {
        return;
      }
      if (userInvitations.hasNextPage) {
        userInvitations.fetchNext?.();
      } else {
        userSuggestions.fetchNext?.();
      }
    },
  });

  return {
    userInvitations,
    userSuggestions,
    ref,
  };
};

const AcceptRejectSuggestionButtons = (props: OrganizationSuggestionResource) => {
  const card = useCardState();
  const { userSuggestions } = useOrganizationList({
    userSuggestions: organizationListParams.userSuggestions,
  });

  const handleAccept = () => {
    return card
      .runAsync(props.accept)
      .then(updatedItem => userSuggestions?.setData?.(pages => populateCacheUpdateItem(updatedItem, pages)))
      .catch(err => handleError(err, [], card.setError));
  };

  if (props.status === 'accepted') {
    return (
      <Text
        colorScheme='secondary'
        localizationKey={localizationKeys('organizationSwitcher.suggestionsAcceptedLabel')}
      />
    );
  }

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherInvitationAcceptButton}
      textVariant='buttonSmall'
      variant='outline'
      colorScheme='neutral'
      size='sm'
      isLoading={card.isLoading}
      onClick={handleAccept}
      localizationKey={localizationKeys('organizationSwitcher.action__suggestionsAccept')}
    />
  );
};

const AcceptRejectInvitationButtons = (props: { onAccept: () => void }) => {
  const card = useCardState();

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherInvitationAcceptButton}
      textVariant='buttonSmall'
      variant='outline'
      colorScheme='neutral'
      size='xs'
      isLoading={card.isLoading}
      onClick={props.onAccept}
      localizationKey={localizationKeys('organizationSwitcher.action__invitationAccept')}
    />
  );
};

const Preview = (
  props: PropsWithChildren<{
    publicOrganizationData:
      | UserOrganizationInvitationResource['publicOrganizationData']
      | OrganizationSuggestionResource['publicOrganizationData'];
  }>,
) => {
  const { children, publicOrganizationData } = props;
  return (
    <Flex
      align='center'
      gap={2}
      sx={t => ({
        justifyContent: 'space-between',
        padding: `${t.space.$4} ${t.space.$5}`,
      })}
      elementDescriptor={descriptors.organizationSwitcherPopoverInvitationActionsBox}
    >
      <OrganizationPreview
        elementId='organizationSwitcherListedOrganization'
        organization={publicOrganizationData}
        sx={t => ({
          color: t.colors.$colorMutedForeground,
          ':hover': {
            color: t.colors.$colorMutedForeground,
          },
        })}
      />

      {children}
    </Flex>
  );
};

const InvitationPreview = withCardStateProvider(
  (props: { invitation: UserOrganizationInvitationResource } & UserInvitationSuggestionListProps) => {
    const { invitation, onOrganizationClick } = props;
    const { accept, publicOrganizationData, status } = invitation;
    const card = useCardState();
    const { getOrganization } = useClerk();
    const { organization: activeOrganization } = useOrganization();
    const { userInvitations } = useOrganizationList({
      userInvitations: organizationListParams.userInvitations,
      userMemberships: organizationListParams.userMemberships,
    });
    const { acceptedInvitations, setAcceptedInvitations } = useAcceptedInvitations();
    const acceptedOrganization = acceptedInvitations.find(item => item.invitation.id === invitation.id)?.organization;

    const handleAccept = () => {
      return card
        .runAsync(async () => {
          const updatedItem = await accept();
          const organization = await getOrganization(publicOrganizationData.id);
          return [updatedItem, organization] as const;
        })
        .then(([updatedItem, organization]) => {
          // Update cache in case another listener depends on it
          void userInvitations?.setData?.(cachedPages => populateCacheUpdateItem(updatedItem, cachedPages, 'negative'));
          setAcceptedInvitations(old => [
            ...old,
            {
              organization,
              invitation: updatedItem,
            },
          ]);
        })
        .catch(err => handleError(err, [], card.setError));
    };

    if (status === 'accepted') {
      if (
        invitation.publicOrganizationData.id === activeOrganization?.id ||
        (acceptedOrganization?.id && activeOrganization?.id === acceptedOrganization.id)
      ) {
        // Hide the Accepted invitation that looks like a membership when the organization is already active
        return null;
      }
      return (
        <PreviewButton
          elementDescriptor={descriptors.organizationSwitcherPreviewButton}
          icon={SwitchArrowRight}
          onClick={acceptedOrganization ? () => onOrganizationClick(acceptedOrganization) : undefined}
          role='menuitem'
        >
          <OrganizationPreview
            elementId='organizationSwitcherListedOrganization'
            organization={publicOrganizationData}
            sx={t => ({
              color: t.colors.$colorMutedForeground,
              ':hover': {
                color: t.colors.$colorMutedForeground,
              },
            })}
          />
        </PreviewButton>
      );
    }
    return (
      <Preview publicOrganizationData={publicOrganizationData}>
        <AcceptRejectInvitationButtons onAccept={handleAccept} />
      </Preview>
    );
  },
);

const SwitcherInvitationActions = (props: PropsOfComponent<typeof Flex> & { showBorder: boolean }) => {
  const { showBorder, ...restProps } = props;
  return (
    <Actions
      role='menu'
      {...restProps}
    />
  );
};

export const SuggestionPreview = withCardStateProvider((props: OrganizationSuggestionResource) => {
  return (
    <Preview publicOrganizationData={props.publicOrganizationData}>
      <AcceptRejectSuggestionButtons {...props} />
    </Preview>
  );
});

type UserInvitationSuggestionListProps = { onOrganizationClick: (org: OrganizationResource) => unknown };
export const UserInvitationSuggestionList = (props: UserInvitationSuggestionListProps) => {
  const { onOrganizationClick } = props;
  const { ref, userSuggestions, userInvitations } = useFetchInvitations();
  const isLoading = userInvitations.isLoading || userSuggestions.isLoading;
  const hasNextPage = userInvitations.hasNextPage || userSuggestions.hasNextPage;

  // Filter out falsy values that can occur when infinite loading resolves pages out of order
  const userInvitationsData = userInvitations.data?.filter(a => !!a) || [];
  const userSuggestionsData = userSuggestions.data?.filter(a => !!a) || [];
  const hasAnyData = userInvitationsData.length > 0 || userSuggestionsData.length > 0;

  if (!hasAnyData && !isLoading) {
    return null;
  }

  return (
    <SwitcherInvitationActions
      showBorder={hasAnyData || isLoading}
      elementDescriptor={descriptors.organizationSwitcherPopoverInvitationActions}
    >
      <Box
        sx={t => ({
          // 4 items + 4px border (four 1px borders)
          maxHeight: `calc(4 * ${t.sizes.$17} + 4px)`,
          overflowY: 'auto',
          ...common.unstyledScrollbar(t),
        })}
      >
        {userInvitationsData?.map(inv => {
          return (
            <InvitationPreview
              key={inv.id}
              invitation={inv}
              onOrganizationClick={onOrganizationClick}
            />
          );
        })}

        {!userInvitations.hasNextPage &&
          userSuggestionsData?.map(suggestion => {
            return (
              <SuggestionPreview
                key={suggestion.id}
                {...suggestion}
              />
            );
          })}

        {(hasNextPage || isLoading) && <InfiniteListSpinner ref={ref} />}
      </Box>
    </SwitcherInvitationActions>
  );
};
