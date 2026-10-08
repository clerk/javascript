import type { ReactNode } from 'react';

import { NotificationCountBadge } from '@/ui/common';
import { Box, Col, descriptors, Flex, Icon, localizationKeys, Text } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { Alert } from '@/ui/elements/Alert';
import { Animated } from '@/ui/elements/Animated';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { Tab, TabPanel, TabPanels, Tabs, TabsList } from '@/ui/elements/Tabs';
import { Users } from '@/ui/icons';
import { mqu } from '@/ui/styledSystem';

import type { useOrganizationMembersController } from './organization-members.controller';
import type { useOrganizationMembersModel } from './organization-members.model';

type Data = ReturnType<typeof useOrganizationMembersModel>['view'];

export const OrganizationMembersView = ({
  controller,
  data,
  membersActions,
  activeMembers,
  invitations,
  requests,
}: {
  controller: ReturnType<typeof useOrganizationMembersController>;
  data: Data;
  membersActions: ReactNode;
  activeMembers: ReactNode;
  invitations: ReactNode;
  requests: ReactNode;
}) => (
  <ProfileCard.Page>
    <Col
      elementDescriptor={descriptors.page}
      gap={2}
      sx={{ isolation: 'isolate' }}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationMembers')}
        gap={4}
        sx={theme => ({ paddingBottom: theme.space.$13 })}
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
          <Card.Alert>{controller.error}</Card.Alert>
          <Tabs>
            <TabsList sx={theme => ({ gap: theme.space.$2 })}>
              {data.canReadMemberships && (
                <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__members')}>
                  {!!data.membershipCount && (
                    <NotificationCountBadge
                      shouldAnimate={!controller.query}
                      notificationCount={data.membershipCount}
                      colorScheme='outline'
                    />
                  )}
                </Tab>
              )}
              {data.canManageMemberships && (
                <Tab
                  localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__invitations')}
                >
                  {data.showInvitationCount && (
                    <NotificationCountBadge
                      notificationCount={data.invitationCount}
                      colorScheme='outline'
                    />
                  )}
                </Tab>
              )}
              {data.canManageMemberships && data.isDomainsEnabled && (
                <Tab localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__requests')}>
                  {data.showRequestCount && (
                    <NotificationCountBadge
                      notificationCount={data.requestCount}
                      colorScheme='outline'
                    />
                  )}
                </Tab>
              )}
            </TabsList>
            <TabPanels>
              {data.canReadMemberships && (
                <TabPanel sx={{ width: '100%' }}>
                  <Flex
                    gap={4}
                    direction='col'
                    sx={{ width: '100%' }}
                  >
                    <Flex
                      gap={2}
                      direction='col'
                      sx={{ width: '100%' }}
                    >
                      {membersActions}
                      {data.hasRoleSetMigration && (
                        <Alert
                          variant='warning'
                          title={localizationKeys(
                            'organizationProfile.membersPage.alerts.roleSetMigrationInProgress.title',
                          )}
                          subtitle={localizationKeys(
                            'organizationProfile.membersPage.alerts.roleSetMigrationInProgress.subtitle',
                          )}
                        />
                      )}
                      {activeMembers}
                    </Flex>
                  </Flex>
                </TabPanel>
              )}
              {data.canManageMemberships && <TabPanel sx={{ width: '100%' }}>{invitations}</TabPanel>}
              {data.canManageMemberships && data.isDomainsEnabled && (
                <TabPanel sx={{ width: '100%' }}>{requests}</TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Action.Root>
      </Col>

      {data.seatUsage ? (
        <Box
          sx={theme => ({
            position: 'absolute',
            bottom: 0,
            insetInline: 0,
            backgroundColor: theme.colors.$colorBackground,
            borderTop: `1px solid ${theme.colors.$borderAlpha100}`,
            paddingInline: theme.space.$4,
            height: theme.space.$13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Text
            sx={theme => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: theme.space.$2,
            })}
          >
            <Icon
              icon={Users}
              size='md'
              colorScheme='neutral'
            />
            <Text
              as='span'
              colorScheme='inherit'
              localizationKey={localizationKeys('organizationProfile.start.membershipSeatUsageLabel', {
                count: data.seatUsage.count,
                limit: data.seatUsage.limit,
              })}
            />
          </Text>
        </Box>
      ) : null}
    </Col>
  </ProfileCard.Page>
);
