import React from 'react';

import { useCoreOrganization } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys, Text } from '../../customizables';
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
  withCardStateProvider,
} from '../../elements';
import { useNavigate } from '../../hooks';
import { UserAdd } from '../../icons';
import { ActiveMembersList } from './ActiveMembersList';
import { InvitedMembersList } from './InvitedMembersList';

export const OrganizationMembers = withCardStateProvider(() => {
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
          <Header.Root>
            <Header.Title
              localizationKey={localizationKeys('organizationProfile.start.headerTitle__members')}
              textVariant='xxlargeMedium'
            />
            <Header.Subtitle localizationKey={localizationKeys('organizationProfile.start.headerSubtitle__members')} />
          </Header.Root>
          {isAdmin && (
            <IconButton
              onClick={() => navigate('invite-members')}
              icon={UserAdd}
              textVariant='buttonExtraSmallBold'
              localizationKey={localizationKeys('organizationProfile.membersPage.action__invite')}
            />
          )}
        </Flex>
        <Tabs>
          <TabsList>
            <Tab>
              <Text localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__active')} />
            </Tab>
            {isAdmin && (
              <Tab>
                <Text
                  localizationKey={localizationKeys('organizationProfile.membersPage.start.headerTitle__invited')}
                />
              </Tab>
            )}
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
});
