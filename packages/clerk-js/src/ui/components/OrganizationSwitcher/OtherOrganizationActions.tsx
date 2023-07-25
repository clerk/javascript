import type { OrganizationResource, UserOrganizationInvitationResource } from '@clerk/types';
import React from 'react';
import { useInView } from 'react-intersection-observer';

import { Plus, SwitchArrows } from '../../../ui/icons';
import {
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useOrganizationSwitcherContext,
} from '../../contexts';
import { Box, Button, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { Action, OrganizationPreview, PersonalWorkspacePreview, PreviewButton, SecondaryActions } from '../../elements';
import { common } from '../../styledSystem';

type OrganizationActionListProps = {
  onCreateOrganizationClick: React.MouseEventHandler;
  onPersonalWorkspaceClick: React.MouseEventHandler;
  onOrganizationClick: (org: OrganizationResource) => unknown;
};

export const OrganizationActionList = (props: OrganizationActionListProps) => {
  const { onCreateOrganizationClick, onPersonalWorkspaceClick, onOrganizationClick } = props;
  const { organizationList, userInvitations } = useCoreOrganizationList({
    userInvitations: {
      aggregate: true,
    },
  });

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (inView) {
        void userInvitations?.setSize?.(n => n + 1);
      }
    },
  });

  const { organization: currentOrg } = useCoreOrganization();
  const user = useCoreUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;
  const { hidePersonal } = useOrganizationSwitcherContext();

  const otherOrgs = (organizationList || []).map(e => e.organization).filter(o => o.id !== currentOrg?.id);

  const createOrganizationButton = (
    <Action
      elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
      elementId={descriptors.organizationSwitcherPopoverActionButton.setId('createOrganization')}
      iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
      iconBoxElementId={descriptors.organizationSwitcherPopoverActionButtonIconBox.setId('createOrganization')}
      iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
      iconElementId={descriptors.organizationSwitcherPopoverActionButtonIcon.setId('createOrganization')}
      textElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonText}
      textElementId={descriptors.organizationSwitcherPopoverActionButtonText.setId('createOrganization')}
      icon={Plus}
      label={localizationKeys('organizationSwitcher.action__createOrganization')}
      onClick={onCreateOrganizationClick}
    />
  );

  return (
    <SecondaryActions elementDescriptor={descriptors.organizationSwitcherPopoverActions}>
      <Box
        sx={t => ({
          maxHeight: `calc(4 * ${t.sizes.$12})`,
          overflowY: 'auto',
          ...common.unstyledScrollbar(t),
        })}
      >
        {currentOrg && !hidePersonal && (
          <PreviewButton
            elementDescriptor={descriptors.organizationSwitcherPreviewButton}
            icon={SwitchArrows}
            sx={{ borderRadius: 0 }}
            onClick={onPersonalWorkspaceClick}
          >
            <PersonalWorkspacePreview
              user={userWithoutIdentifiers}
              size='sm'
              avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
              title={localizationKeys('organizationSwitcher.personalWorkspace')}
            />
          </PreviewButton>
        )}
        {otherOrgs.map(organization => (
          <PreviewButton
            key={organization.id}
            elementDescriptor={descriptors.organizationSwitcherPreviewButton}
            icon={SwitchArrows}
            sx={{ borderRadius: 0 }}
            onClick={() => onOrganizationClick(organization)}
          >
            <OrganizationPreview
              elementId={'organizationSwitcher'}
              avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
              organization={organization}
              size='sm'
            />
          </PreviewButton>
        ))}
      </Box>

      {userInvitations.isLoading && <p>is loading</p>}

      {userInvitations.count > 0 && (
        <>
          <Text
            variant={'smallRegular'}
            sx={[
              t => ({
                minHeight: 'unset',
                height: t.space.$12,
                padding: `${t.space.$3} ${t.space.$6}`,
                display: 'flex',
                alignItems: 'center',
              }),
            ]}
          >
            1 pending invitation to join:
          </Text>
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

            {userInvitations.count > (userInvitations.data?.length || 0) && (
              <Box
                ref={ref}
                sx={[
                  t => ({
                    width: '100%',
                    height: t.sizes.$8,
                    position: 'relative',
                  }),
                ]}
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
        </>
      )}
      {user.createOrganizationEnabled && createOrganizationButton}
    </SecondaryActions>
  );
};

const InvitationPreview = (props: UserOrganizationInvitationResource) => {
  return (
    <Flex
      align={'center'}
      gap={2}
      sx={[
        t => ({
          minHeight: 'unset',
          height: t.space.$12,
          justifyContent: 'space-between',
          padding: `0 ${t.space.$6}`,
          ':hover > .cl-organizationSwitcherPreviewButton': {
            opacity: 1,
            transform: 'translateY(0px)',
            tabIndex: 1,
          },
          ':focus-within > .cl-organizationSwitcherPreviewButton': {
            opacity: 1,
            transform: 'translateY(0px)',
            tabIndex: 1,
          },
        }),
      ]}
    >
      <OrganizationPreview
        elementId={'organizationSwitcher'}
        avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
        organization={props.organization}
        size='sm'
      />

      <Button
        elementDescriptor={descriptors.organizationSwitcherPreviewButton}
        variant={'ghost'}
        hoverAsFocus
        textVariant='buttonExtraSmallBold'
        sx={[
          t => ({
            tabIndex: 0,
            opacity: 0,
            transform: 'translateY(3px)',
            transitionDuration: t.transitionDuration.$slower,
          }),
        ]}
      >
        Reject
      </Button>
      <Button
        textVariant='buttonExtraSmallBold'
        variant={'solid'}
      >
        Join
      </Button>
    </Flex>
  );
};
