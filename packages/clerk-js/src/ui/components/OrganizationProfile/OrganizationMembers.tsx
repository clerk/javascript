import React from 'react';

import { useEnvironment } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys } from '../../customizables';
import { Header, IconButton, NavbarMenuButtonRow, Tab, TabPanel, TabPanels, Tabs, TabsList } from '../../elements';
import { useNavigate } from '../../hooks';
import { UserAdd } from '../../icons';
import { MembersListTable } from './MemberListTable';

export const OrganizationMembers = () => {
  const { navigate } = useNavigate();
  const { attributes } = useEnvironment().userSettings;

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
    >
      <NavbarMenuButtonRow />
      <Col
        // elementDescriptor={descriptors.profilePage}
        // elementId={descriptors.profilePage.setId('account')}
        gap={8}
      >
        <Flex
          justify={'between'}
          align={'center'}
        >
          <Header.Root id='cl-section-members'>
            <Header.Title
              localizationKey={localizationKeys('organizationProfile.start.headerTitle__members')}
              textVariant='xxlargeMedium'
            />
            <Header.Subtitle
              // localizationKey={localizationKeys('organizationProfile.start.headerSubtitle__account')}
              localizationKey={'View and manage organization members'}
            />
          </Header.Root>
          <IconButton
            onClick={() => navigate('invite-members')}
            icon={UserAdd}
            textVariant='buttonExtraSmallBold'
          >
            Invite
          </IconButton>
        </Flex>
        <Tabs>
          <TabsList>
            <Tab>Active</Tab>
            <Tab>Invited</Tab>
          </TabsList>
          <TabPanels>
            <TabPanel sx={{ width: '100%' }}>
              <ActiveMembersList />
            </TabPanel>
            <TabPanel sx={{ width: '100%' }}>
              <InvitedMembersList />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Col>
    </Col>
  );
};

const mockUsers = Array.from({ length: 34 }, (_, i) => ({
  id: i.toString(),
  firstName: `Corey${i}`,
  lastName: `Doken${i}`,
  primaryEmailAddress: {
    emailAddress: `hello${i}@gmail.com`,
  },
  role: i % 2 ? 'admin' : 'basic_member',
}));

const ActiveMembersList = () => {
  return (
    <MembersListTable
      users={mockUsers}
      actions={[{ label: 'Remove member', destructive: true, onClick: () => {} }]}
    />
  );
};

const InvitedMembersList = () => {
  return (
    <MembersListTable
      users={mockUsers.slice(0, 7)}
      actions={[
        { label: 'Resend invitation', onClick: () => {} },
        { label: 'Revoke invitation', destructive: true, onClick: () => {} },
      ]}
    />
  );
};
