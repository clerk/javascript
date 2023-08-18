import type { OrganizationMembershipResource, OrganizationResource } from '@clerk/types';

import { useCoreOrganizationList, useOrganizationListContext } from '../../contexts';
import { Box, Button, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { OrganizationPreview, useCardState, withCardStateProvider } from '../../elements';
import { useInView } from '../../hooks';
import { common } from '../../styledSystem';
import { organizationListParams } from './utils';

export const UserMembershipList = () => {
  const { userMemberships } = useCoreOrganizationList({
    userMemberships: organizationListParams.userMemberships,
  });

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (inView) {
        userMemberships.fetchNext?.();
      }
    },
  });

  if ((userMemberships.count ?? 0) === 0) {
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
          (userMemberships.count ?? 0) > 1
            ? 'organizationList.organizationCountLabel_many'
            : 'organizationList.organizationCountLabel_single',
          {
            count: userMemberships.count,
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
        {userMemberships?.data?.map(inv => {
          return (
            <InvitationPreview
              key={inv.id}
              {...inv}
            />
          );
        })}

        {userMemberships.hasNextPage && (
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

const SetActiveButton = (props: OrganizationResource) => {
  const card = useCardState();
  const { navigateAfterSelectOrganization } = useOrganizationListContext();
  const { isLoaded, setActive } = useCoreOrganizationList();

  if (!isLoaded) {
    return null;
  }
  const handleOrganizationClicked = (organization: OrganizationResource) => {
    return card.runAsync(() =>
      setActive({
        organization,
        beforeEmit: () => navigateAfterSelectOrganization(organization),
      }),
    );
  };

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherInvitationAcceptButton}
      textVariant='buttonExtraSmallBold'
      variant='solid'
      size='sm'
      isLoading={card.isLoading}
      onClick={() => handleOrganizationClicked(props)}
      localizationKey={localizationKeys('organizationList.action__setActiveOrganization')}
    />
  );
};

const InvitationPreview = withCardStateProvider((props: OrganizationMembershipResource) => {
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
          color: t.colors.$colorText,
        })}
        organization={props.organization}
      />

      <SetActiveButton {...props.organization} />
    </Flex>
  );
});
