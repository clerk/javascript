import { useOrganization } from '@clerk/shared/react';
import { useState } from 'react';

import { Animated } from '@/ui/elements/Animated';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { Tab, TabPanel, TabPanels, Tabs, TabsList } from '@/ui/elements/Tabs';

import { NotificationCountBadge, useProtect } from '../../common';
import { useEnvironment, useOrganizationProfileContext } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys } from '../../customizables';
import { Action } from '../../elements/Action';
import { mqu } from '../../styledSystem';
import { ActiveMembersList } from './ActiveMembersList';
import { MembersActionsRow } from './MembersActions';
import { MembersSearch } from './MembersSearch';
import { OrganizationMembersTabInvitations } from './OrganizationMembersTabInvitations';
import { OrganizationMembersTabRequests } from './OrganizationMembersTabRequests';

export const ACTIVE_MEMBERS_PAGE_SIZE = 10;

export const OrganizationMembers = withCardStateProvider(() => {
  const { organizationSettings } = useEnvironment();
  const card = useCardState();
  const canManageMemberships = useProtect({ permission: 'org:sys_memberships:manage' });
  const canReadMemberships = useProtect({ permission: 'org:sys_memberships:read' });
  const isDomainsEnabled = organizationSettings?.domains?.enabled && canManageMemberships;

  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

  const { membershipRequests, memberships, invitations } = useOrganization({
    membershipRequests: isDomainsEnabled || undefined,
    invitations: canManageMemberships || undefined,
    memberships: canReadMemberships
      ? {
          keepPreviousData: true,
          query: query || undefined,
        }
      : undefined,
  });

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
            <TabsList sx={t => ({ gap: t.space.$2 })}>
              {canReadMemberships && (
                <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__members')}>
                  {!!memberships?.count && (
                    <NotificationCountBadge
                      shouldAnimate={!query}
                      notificationCount={memberships.count}
                      colorScheme='outline'
                    />
                  )}
                </Tab>
              )}
              {canManageMemberships && (
                <Tab
                  localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__invitations')}
                >
                  {invitations?.data && !invitations.isLoading && (
                    <NotificationCountBadge
                      notificationCount={invitations.count}
                      colorScheme='outline'
                    />
                  )}
                </Tab>
              )}
              {canManageMemberships && isDomainsEnabled && (
                <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__requests')}>
                  {membershipRequests?.data && !membershipRequests.isLoading && (
                    <NotificationCountBadge
                      notificationCount={membershipRequests.count}
                      colorScheme='outline'
                    />
                  )}
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
                    <Flex
                      gap={2}
                      direction='col'
                      sx={{
                        width: '100%',
                      }}
                    >
                      <MembersActionsRow
                        actionSlot={
                          <MembersSearch
                            query={query}
                            value={search}
                            memberships={memberships}
                            onSearchChange={query => setSearch(query)}
                            onQueryTrigger={query => setQuery(query)}
                          />
                        }
                      />
                      <ActiveMembersList
                        pageSize={ACTIVE_MEMBERS_PAGE_SIZE}
                        memberships={memberships}
                      />
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
