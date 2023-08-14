import type { ClerkPaginatedResponse, UserOrganizationInvitationResource } from '@clerk/types';

import { useCoreOrganizationList } from '../../contexts';
import { Box, Button, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { OrganizationPreview, useCardState, withCardStateProvider } from '../../elements';
import { useInView } from '../../hooks';
import { common } from '../../styledSystem';
import { handleError } from '../../utils';
import { organizationListParams } from './utils';

export const UserInvitationList = () => {
  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (inView) {
        userInvitations.fetchNext?.();
      }
    },
  });

  const { userInvitations } = useCoreOrganizationList({
    userInvitations: organizationListParams.userInvitations,
  });

  if ((userInvitations.count ?? 0) === 0) {
    return null;
  }

  return (
    <Flex
      direction='col'
      elementDescriptor={descriptors.organizationSwitcherPopoverInvitationActions}
    >
      <Text
        variant='smallRegular'
        sx={t => ({
          minHeight: 'unset',
          height: t.space.$12,
          padding: `${t.space.$3} ${t.space.$6}`,
          display: 'flex',
          alignItems: 'center',
        })}
        // Handle plurals
        localizationKey={localizationKeys(
          (userInvitations.count ?? 0) > 1
            ? 'organizationSwitcher.invitationCountLabel_many'
            : 'organizationSwitcher.invitationCountLabel_single',
          {
            count: userInvitations.count,
          },
        )}
      />
      <Box
        sx={t => ({
          maxHeight: `calc(4 * ${t.sizes.$12})`,
          overflowY: 'auto',
          ...common.unstyledScrollbar(t),
        })}
      >
        {userInvitations?.data?.map(inv => {
          return (
            <InvitationPreview
              key={inv.id}
              {...inv}
            />
          );
        })}

        {(userInvitations.hasNextPage || userInvitations.isFetching) && (
          <Box
            ref={ref}
            sx={t => ({
              width: '100%',
              height: t.space.$12,
              position: 'relative',
            })}
          >
            <Box
              sx={{
                margin: 'auto',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translateY(-50%) translateX(-50%)',
              }}
            >
              <Spinner
                size='md'
                colorScheme='primary'
              />
            </Box>
          </Box>
        )}
      </Box>
    </Flex>
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
      .then(result => {
        (userInvitations as any)?.unstable__mutate?.(result, {
          populateCache: (
            updatedInvitation: UserOrganizationInvitationResource,
            invitationInfinitePages: ClerkPaginatedResponse<UserOrganizationInvitationResource>[],
          ) => {
            const prevTotalCount = invitationInfinitePages[invitationInfinitePages.length - 1].total_count;

            return invitationInfinitePages.map(item => {
              const newData = item.data.filter(obj => {
                return obj.id !== updatedInvitation.id;
              });
              return { ...item, data: newData, total_count: prevTotalCount - 1 };
            });
          },
          // Since `accept` gives back the updated information,
          // we don't need to revalidate here.
          revalidate: false,
        });
      })
      .catch(err => handleError(err, [], card.setError));
  };

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherInvitationAcceptButton}
      textVariant='buttonExtraSmallBold'
      variant='solid'
      size='sm'
      isLoading={card.isLoading}
      onClick={handleAccept}
      localizationKey={localizationKeys('organizationSwitcher.action__invitationAccept')}
    />
  );
};

const InvitationPreview = withCardStateProvider((props: UserOrganizationInvitationResource) => {
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
        organization={props.publicOrganizationData}
        size='sm'
      />

      <AcceptRejectInvitationButtons {...props} />
    </Flex>
  );
});
