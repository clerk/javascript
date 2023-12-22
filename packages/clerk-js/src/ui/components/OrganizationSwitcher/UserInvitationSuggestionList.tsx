import { useClerk, useOrganizationList } from '@clerk/shared/react';
import type {
  OrganizationResource,
  OrganizationSuggestionResource,
  UserOrganizationInvitationResource,
} from '@clerk/types';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import { InfiniteListSpinner } from '../../common';
import { Box, Button, descriptors, Flex, localizationKeys, Text } from '../../customizables';
import { Actions, OrganizationPreview, PreviewButton, useCardState, withCardStateProvider } from '../../elements';
import { useInView } from '../../hooks';
import { SwitchArrowRight } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { common } from '../../styledSystem';
import { handleError } from '../../utils';
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
        colorScheme='neutral'
        localizationKey={localizationKeys('organizationSwitcher.suggestionsAcceptedLabel')}
      />
    );
  }

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherInvitationAcceptButton}
      textVariant='buttonSmall'
      variant='secondary'
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
      variant='secondary'
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
    >
      <OrganizationPreview
        elementId='organizationSwitcherListedOrganization'
        organization={publicOrganizationData}
        sx={t => ({
          color: t.colors.$blackAlpha600,
          ':hover': {
            color: t.colors.$blackAlpha600,
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
    const { accept, publicOrganizationData } = invitation;
    const card = useCardState();
    const { getOrganization } = useClerk();
    const [acceptedOrganization, setAcceptedOrganization] = useState<OrganizationResource | null>(null);
    const { userInvitations } = useOrganizationList({
      userInvitations: organizationListParams.userInvitations,
      userMemberships: organizationListParams.userMemberships,
    });

    const handleAccept = () => {
      return card
        .runAsync(async () => {
          const updatedItem = await accept();
          const organization = await getOrganization(publicOrganizationData.id);
          return [updatedItem, organization] as const;
        })
        .then(([updatedItem, organization]) => {
          // Update cache in case another listener depends on it
          void userInvitations?.setData?.(cachedPages => populateCacheUpdateItem(updatedItem, cachedPages));
          setAcceptedOrganization(organization);
        })
        .catch(err => handleError(err, [], card.setError));
    };

    if (acceptedOrganization) {
      return (
        <PreviewButton
          elementDescriptor={descriptors.organizationSwitcherPreviewButton}
          icon={SwitchArrowRight}
          onClick={() => onOrganizationClick(acceptedOrganization)}
          role='menuitem'
        >
          <OrganizationPreview
            elementId='organizationSwitcherListedOrganization'
            organization={publicOrganizationData}
            sx={t => ({
              color: t.colors.$blackAlpha600,
              ':hover': {
                color: t.colors.$blackAlpha600,
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
      sx={t => ({
        borderBottom: showBorder ? `${t.borders.$normal} ${t.colors.$blackAlpha100}` : 'none',
      })}
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
  const hasAnyData = !!(userInvitations.count || userSuggestions.count);
  return (
    <SwitcherInvitationActions
      showBorder={hasAnyData || isLoading}
      elementDescriptor={descriptors.organizationSwitcherPopoverInvitationActions}
    >
      <Box
        sx={t => ({
          maxHeight: `calc(4 * ${t.sizes.$12})`,
          overflowY: 'auto',
          ...common.unstyledScrollbar(t),
        })}
      >
        {(userInvitations.count || 0) > 0 &&
          userInvitations.data?.map(inv => {
            return (
              <InvitationPreview
                key={inv.id}
                invitation={inv}
                onOrganizationClick={onOrganizationClick}
              />
            );
          })}

        {(userSuggestions.count || 0) > 0 &&
          !userInvitations.hasNextPage &&
          userSuggestions.data?.map(suggestion => {
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
