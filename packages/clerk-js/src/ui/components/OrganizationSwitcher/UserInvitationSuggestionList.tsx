import type { OrganizationSuggestionResource, UserOrganizationInvitationResource } from '@clerk/types';
import type { PropsWithChildren } from 'react';

import { InfiniteListSpinner } from '../../common';
import { useCoreOrganizationList } from '../../contexts';
import { Box, Button, descriptors, Flex, localizationKeys, Text } from '../../customizables';
import { Actions, OrganizationPreview, useCardState, withCardStateProvider } from '../../elements';
import { useInView } from '../../hooks';
import type { PropsOfComponent } from '../../styledSystem';
import { common } from '../../styledSystem';
import { handleError } from '../../utils';
import { organizationListParams, populateCacheRemoveItem, populateCacheUpdateItem } from './utils';

const useFetchInvitations = () => {
  const { userInvitations, userSuggestions } = useCoreOrganizationList(organizationListParams);

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
  const { userSuggestions } = useCoreOrganizationList({
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
        variant='smallRegular'
        colorScheme='neutral'
        localizationKey={localizationKeys('organizationSwitcher.suggestionsAcceptedLabel')}
      />
    );
  }

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherInvitationAcceptButton}
      textVariant='buttonExtraSmallBold'
      variant='outline'
      colorScheme='neutral'
      size='sm'
      isLoading={card.isLoading}
      onClick={handleAccept}
      localizationKey={localizationKeys('organizationSwitcher.action__suggestionsAccept')}
    />
  );
};

const AcceptRejectInvitationButtons = (props: UserOrganizationInvitationResource) => {
  const card = useCardState();
  const { userInvitations } = useCoreOrganizationList({
    userInvitations: organizationListParams.userInvitations,
  });

  const handleAccept = () => {
    return card
      .runAsync(props.accept)
      .then(updatedItem => userInvitations?.setData?.(pages => populateCacheRemoveItem(updatedItem, pages)))
      .catch(err => handleError(err, [], card.setError));
  };

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherInvitationAcceptButton}
      textVariant='buttonExtraSmallBold'
      variant='outline'
      colorScheme='neutral'
      size='sm'
      isLoading={card.isLoading}
      onClick={handleAccept}
      localizationKey={localizationKeys('organizationSwitcher.action__invitationAccept')}
    />
  );
};

const InvitationPreview = withCardStateProvider(
  (
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
          minHeight: 'unset',
          height: t.space.$12,
          justifyContent: 'space-between',
          padding: `0 ${t.space.$6}`,
        })}
      >
        <OrganizationPreview
          elementId='organizationSwitcher'
          avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
          organization={publicOrganizationData}
          size='sm'
        />

        {children}
      </Flex>
    );
  },
);

const SwitcherInvitationActions = (props: PropsOfComponent<typeof Flex> & { showBorder: boolean }) => {
  const { showBorder, ...restProps } = props;
  return (
    <Actions
      sx={t => ({
        borderTop: showBorder ? `${t.borders.$normal} ${t.colors.$blackAlpha200}` : 'none',
      })}
      role='menu'
      {...restProps}
    />
  );
};

export const UserInvitationSuggestionList = () => {
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
                publicOrganizationData={inv.publicOrganizationData}
              >
                <AcceptRejectInvitationButtons {...inv} />
              </InvitationPreview>
            );
          })}

        {(userSuggestions.count || 0) > 0 &&
          !userInvitations.hasNextPage &&
          userSuggestions.data?.map(suggestion => {
            return (
              <InvitationPreview
                key={suggestion.id}
                publicOrganizationData={suggestion.publicOrganizationData}
              >
                <AcceptRejectSuggestionButtons {...suggestion} />
              </InvitationPreview>
            );
          })}

        {(hasNextPage || isLoading) && <InfiniteListSpinner ref={ref} />}
      </Box>
    </SwitcherInvitationActions>
  );
};
