import { useEnvironment } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { CardAlert, Header, useCardState, withCardStateProvider } from '../../elements';
import { NavbarMenuButtonRow } from '../../elements/Navbar';
import { ActiveDevicesSection } from './ActiveDevicesSection';
import { ConnectedAccountsSection } from './ConnectedAccountsSection';
import { EmailsSection } from './EmailSection';
import { MfaSection } from './MfaSection';
import { PasswordSection } from './PasswordSection';
import { PhoneSection } from './PhoneSection';
import { SamlAccountsSection } from './SamlAccountsSection';
import { UsernameSection } from './UsernameSection';
import { UserProfileSection } from './UserProfileSection';
import { getSecondFactors } from './utils';
import { Web3Section } from './Web3Section';

export const RootPage = withCardStateProvider(() => {
  const { attributes, social, saml, instanceIsPasswordBased } = useEnvironment().userSettings;
  const card = useCardState();
  const showUsername = attributes.username.enabled;
  const showEmail = attributes.email_address.enabled;
  const showPhone = attributes.phone_number.enabled;
  const showConnectedAccounts = social && Object.values(social).filter(p => p.enabled).length > 0;
  const showSamlAccounts = saml && saml.length > 0;
  const showWeb3 = attributes.web3_wallet.enabled;
  const showPassword = instanceIsPasswordBased;
  const showMfa = getSecondFactors(attributes).length > 0;

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
    >
      <NavbarMenuButtonRow />
      <CardAlert>{card.error}</CardAlert>
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('account')}
        gap={8}
      >
        <Header.Root id='cl-section-account'>
          <Header.Title
            localizationKey={localizationKeys('userProfile.start.headerTitle__account')}
            textVariant='xxlargeMedium'
          />
          <Header.Subtitle localizationKey={localizationKeys('userProfile.start.headerSubtitle__account')} />
        </Header.Root>

        <UserProfileSection />
        {showUsername && <UsernameSection />}
        {showEmail && <EmailsSection />}
        {showPhone && <PhoneSection />}
        {showConnectedAccounts && <ConnectedAccountsSection />}
        {showSamlAccounts && <SamlAccountsSection />}
        {showWeb3 && <Web3Section />}
      </Col>
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('security')}
        gap={8}
      >
        <Header.Root id='cl-section-security'>
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
});
