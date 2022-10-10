import React from 'react';

import { useEnvironment } from '../contexts';
import { Col, descriptors, localizationKeys } from '../customizables';
import { Header, Tab, TabPanel, TabPanels, Tabs, TabsList } from '../elements';
import { ActiveDevicesSection } from './ActiveDevicesSection';
import { ConnectedAccountsSection } from './ConnectedAccountsSection';
import { EmailsSection } from './EmailSection';
import { MfaSection } from './MfaSection';
import { NavbarMenuButtonRow } from './Navbar';
import { PasswordSection } from './PasswordSection';
import { PhoneSection } from './PhoneSection';
import { UsernameSection } from './UsernameSection';
import { UserProfileSection } from './UserProfileSection';
import { getSecondFactors } from './utils';
import { Web3Section } from './Web3Section';

export const RootPage = () => {
  const { attributes, social } = useEnvironment().userSettings;
  const showUsername = attributes.username.enabled;
  const showEmail = attributes.email_address.enabled;
  const showPhone = attributes.phone_number.enabled;
  const showConnectedAccounts = social && Object.values(social).filter(p => p.enabled).length > 0;
  const showWeb3 = attributes.web3_wallet.enabled;
  const showPassword = attributes.password.enabled && attributes.password.required;
  const showMfa = getSecondFactors(attributes).length > 0;

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
    >
      <NavbarMenuButtonRow />
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('account')}
        gap={8}
      >
        <Header.Root id='cl-userProfile-section-account'>
          <Header.Title
            localizationKey={localizationKeys('userProfile.start.headerTitle__account')}
            textVariant='xxlargeMedium'
          />
          <Header.Subtitle localizationKey={localizationKeys('userProfile.start.headerSubtitle__account')} />
        </Header.Root>
        <UserProfileSection />

        <Tabs>
          <TabsList>
            <Tab>Active</Tab>
            <Tab>Invited</Tab>
            <Tab>Danger</Tab>
          </TabsList>
          <TabPanels>
            <TabPanel>section 1</TabPanel>
            <TabPanel>section 2</TabPanel>
            <TabPanel>section 3</TabPanel>
          </TabPanels>
        </Tabs>

        {showUsername && <UsernameSection />}
        {showEmail && <EmailsSection />}
        {showPhone && <PhoneSection />}
        {showConnectedAccounts && <ConnectedAccountsSection />}
        {showWeb3 && <Web3Section />}
      </Col>
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('security')}
        gap={8}
      >
        <Header.Root id='cl-userProfile-section-security'>
          <Header.Title
            localizationKey={localizationKeys('userProfile.start.headerTitle__security')}
            textVariant='xxlargeMedium'
          />
          <Header.Subtitle localizationKey={localizationKeys('userProfile.start.headerSubtitle__security')} />
        </Header.Root>
        {showPassword && <PasswordSection />}
        {showMfa && <MfaSection />}
        <ActiveDevicesSection />
      </Col>
    </Col>
  );
};
