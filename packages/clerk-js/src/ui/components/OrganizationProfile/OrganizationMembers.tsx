import { useOrganization } from '@clerk/shared/react';

import { NotificationCountBadge, useProtect } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys } from '../../customizables';
import {
  Animated,
  Card,
  Header,
  Tab,
  TabPanel,
  TabPanels,
  Tabs,
  TabsList,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { Action } from '../../elements/Action';
import { mqu } from '../../styledSystem';
import { ActiveMembersList } from './ActiveMembersList';
import { MembersActionsRow } from './MembersActions';
import { MembershipWidget } from './MembershipWidget';
import { OrganizationMembersTabInvitations } from './OrganizationMembersTabInvitations';
import { OrganizationMembersTabRequests } from './OrganizationMembersTabRequests';

export const OrganizationMembers = withCardStateProvider(() => {
  const { organizationSettings } = useEnvironment();
  const card = useCardState();
  const canManageMemberships = useProtect({ permission: 'org:sys_memberships:manage' });
  const canReadMemberships = useProtect({ permission: 'org:sys_memberships:read' });
  const isDomainsEnabled = organizationSettings?.domains?.enabled;
  const { membershipRequests, memberships, invitations } = useOrganization({
    membershipRequests: isDomainsEnabled || undefined,
    invitations: canManageMemberships,
    memberships: true,
  });

  // @ts-expect-error This property is not typed. It is used by our dashboard in order to render a billing widget.
  const { __unstable_manageBillingUrl } = useOrganizationProfileContext();

  if (canManageMemberships === null) {
    return null;
  }

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={2}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationMembers')}
        gap={4}
      >
        <Action.Root animate={false}>
          <Animated asChild>
            <Header.Root
              contentSx={{
                [mqu.md]: {
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-between',
                },
              }}
            >
              <Header.Title
                localizationKey={localizationKeys('organizationProfile.start.headerTitle__members')}
                textVariant='h2'
              />
            </Header.Root>
          </Animated>
          <Card.Alert>{card.error}</Card.Alert>
          <Tabs>
            <TabsList sx={t => ({ gap: t.space.$4 })}>
              {canReadMemberships && (
                <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__members')}>
                  <NotificationCountBadge
                    notificationCount={memberships?.count || 0}
                    shouldDelayVisibility
                    colorScheme='neutral'
                  />
                </Tab>
              )}
              {canManageMemberships && (
                <Tab
                  localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__invitations')}
                >
                  <NotificationCountBadge
                    notificationCount={invitations?.count || 0}
                    shouldDelayVisibility
                    colorScheme='neutral'
                  />
                </Tab>
              )}
              {canManageMemberships && isDomainsEnabled && (
                <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__requests')}>
                  <NotificationCountBadge
                    notificationCount={membershipRequests?.count || 0}
                    shouldDelayVisibility
                    colorScheme='neutral'
                  />
                </Tab>
              )}
            </TabsList>
            <TabPanels>
              {canReadMemberships && (
                <TabPanel sx={{ width: '100%' }}>
                  <Flex
                    gap={4}
                    direction='col'
                    sx={{
                      width: '100%',
                    }}
                  >
                    {canManageMemberships && __unstable_manageBillingUrl && <MembershipWidget />}
                    <Flex
                      gap={2}
                      direction='col'
                      sx={{
                        width: '100%',
                      }}
                    >
                      <MembersActionsRow />
                      <ActiveMembersList />
                    </Flex>
                  </Flex>
                </TabPanel>
              )}
              {canManageMemberships && (
                <TabPanel sx={{ width: '100%' }}>
                  <OrganizationMembersTabInvitations />
                </TabPanel>
              )}
              {canManageMemberships && isDomainsEnabled && (
                <TabPanel sx={{ width: '100%' }}>
                  <OrganizationMembersTabRequests />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Action.Root>
      </Col>
    </Col>
  );
});
