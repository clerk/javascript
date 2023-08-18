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
      gap={2}
    >
      <Text
        variant='largeMedium'
        colorScheme='neutral'
        sx={t => ({
          fontWeight: t.fontWeights.$normal,
          minHeight: 'unset',
          height: t.space.$7,
          padding: `${t.space.$none} ${t.space.$8}`,
          display: 'flex',
          alignItems: 'center',
        })}
        // Handle plurals
        localizationKey={localizationKeys(
          (userInvitations.count ?? 0) > 1
            ? 'organizationList.invitationCountLabel_many'
            : 'organizationList.invitationCountLabel_single',
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

        {userInvitations.hasNextPage && (
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
      <Box
        sx={t => ({
          margin: `${t.space.$2} ${t.space.$8} ${t.space.$none} ${t.space.$8}`,
          borderBottom: `${t.borders.$normal} ${t.colors.$blackAlpha200}`,
        })}
      ></Box>
    </Flex>
  );
};

const AcceptRejectInvitationButtons = (props: UserOrganizationInvitationResource) => {
  const card = useCardState();
  const { userInvitations, userMemberships } = useCoreOrganizationList({
    userInvitations: organizationListParams.userInvitations,
    userMemberships: organizationListParams.userMemberships,
  });

  const handleAccept = () => {
    return card
      .runAsync(
        props.accept().then(async res => {
          await (userMemberships as any)?.unstable__mutate();
          return res;
        }),
      )
      .then(async result => {
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

        await (userMemberships as any)?.unstable__mutate();
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
      localizationKey={localizationKeys('organizationList.action__invitationAccept')}
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
        padding: `0 ${t.space.$8}`,
      })}
    >
      <OrganizationPreview
        elementId='organizationList'
        avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)`, width: t.sizes.$10, height: t.sizes.$10 })}
        mainIdentifierSx={t => ({
          fontSize: t.fontSizes.$xl,
        })}
        organization={props.publicOrganizationData}
      />

      <AcceptRejectInvitationButtons {...props} />
    </Flex>
  );
});
