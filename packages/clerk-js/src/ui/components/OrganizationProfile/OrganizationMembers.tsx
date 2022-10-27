import React from 'react';

import { useCoreOrganization } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys } from '../../customizables';
import {
  CardAlert,
  Header,
  IconButton,
  NavbarMenuButtonRow,
  Tab,
  TabPanel,
  TabPanels,
  Tabs,
  TabsList,
  useCardState,
} from '../../elements';
import { useNavigate } from '../../hooks';
import { UserAdd } from '../../icons';
import { ActiveMembersList } from './ActiveMembersList';
import { InvitedMembersList } from './InvitedMembersList';

export const OrganizationMembers = () => {
  const { navigate } = useNavigate();
  const card = useCardState();
  const { membership } = useCoreOrganization();
  const isAdmin = membership?.role === 'admin';

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
    >
      <CardAlert>{card.error}</CardAlert>
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
          {isAdmin && (
            <IconButton
              onClick={() => navigate('invite-members')}
              icon={UserAdd}
              textVariant='buttonExtraSmallBold'
            >
              Invite
            </IconButton>
          )}
        </Flex>
        <Tabs>
          <TabsList>
            <Tab>Active</Tab>
            {isAdmin && <Tab>Invited</Tab>}
          </TabsList>
          <TabPanels>
            <TabPanel sx={{ width: '100%' }}>
              <ActiveMembersList />
            </TabPanel>
            {isAdmin && (
              <TabPanel sx={{ width: '100%' }}>
                <InvitedMembersList />
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Col>
    </Col>
  );
};
