import { AddBlockButton, BlockButton } from '../../common';
import { useCoreOrganization, useEnvironment } from '../../contexts';
import { Col, descriptors, Flex, Icon, localizationKeys } from '../../customizables';
import { Header, IconButton, NavbarMenuButtonRow, OrganizationPreview, ProfileSection } from '../../elements';
import { Times } from '../../icons';
import { useRouter } from '../../router';
import { DomainList } from './DomainList';

export const OrganizationSettings = () => {
  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
    >
      <NavbarMenuButtonRow />
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationSettings')}
        gap={8}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('organizationProfile.start.headerTitle__settings')}
            textVariant='xxlargeMedium'
          />
          <Header.Subtitle localizationKey={localizationKeys('organizationProfile.start.headerSubtitle__settings')} />
        </Header.Root>
        <OrganizationProfileSection />
        <OrganizationDomainsSection />
        <OrganizationDangerSection />
      </Col>
    </Col>
  );
};

const OrganizationProfileSection = () => {
  const { organization, membership } = useCoreOrganization();
  const { navigate } = useRouter();
  const isAdmin = membership?.role === 'admin';

  if (!organization) {
    return null;
  }

  const profile = (
    <OrganizationPreview
      organization={organization}
      size='lg'
    />
  );

  return (
    <ProfileSection
      title={localizationKeys('organizationProfile.profilePage.title')}
      id='organizationProfile'
    >
      {isAdmin ? <BlockButton onClick={() => navigate('profile')}>{profile}</BlockButton> : profile}
    </ProfileSection>
  );
};

const OrganizationDomainsSection = () => {
  const { organizationSettings } = useEnvironment();
  const { organization, membership } = useCoreOrganization();

  const { navigate } = useRouter();
  const isAdmin = membership?.role === 'admin';

  if (!organizationSettings || !organization || !isAdmin) {
    return null;
  }

  if (!organizationSettings.domains.enabled) {
    return null;
  }

  return (
    <ProfileSection
      title={localizationKeys('organizationProfile.profilePage.domainSection.title')}
      subtitle={localizationKeys('organizationProfile.profilePage.domainSection.subtitle')}
      id='organizationDomains'
    >
      <DomainList redirectSubPath={'domain/'} />

      <AddBlockButton
        textLocalizationKey={localizationKeys('organizationProfile.profilePage.domainSection.primaryButton')}
        id='addOrganizationDomain'
        onClick={() => navigate('domain')}
      />
    </ProfileSection>
  );
};

const OrganizationDangerSection = () => {
  const {
    organization,
    membership,
    membershipList: adminMembers,
  } = useCoreOrganization({
    membershipList: { role: ['admin'] },
  });
  const { navigate } = useRouter();

  if (!organization || !membership) {
    return null;
  }

  const adminDeleteEnabled = organization.adminDeleteEnabled;
  const hasMoreThanOneAdmin = (adminMembers?.length || 0) > 1;
  const isAdmin = membership.role === 'admin';

  return (
    <ProfileSection
      id='organizationDanger'
      title={localizationKeys('organizationProfile.profilePage.dangerSection.title')}
      sx={t => ({ marginBottom: t.space.$4 })}
    >
      <Flex gap={4}>
        <IconButton
          aria-label='Leave organization'
          icon={
            <Icon
              icon={Times}
              size={'sm'}
              sx={t => ({ marginRight: t.space.$2 })}
            />
          }
          variant='outline'
          colorScheme='danger'
          textVariant='buttonExtraSmallBold'
          onClick={() => navigate('leave')}
          isDisabled={isAdmin && !hasMoreThanOneAdmin}
          localizationKey={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
        />
        {isAdmin && adminDeleteEnabled && (
          <IconButton
            aria-label='Delete organization'
            icon={
              <Icon
                icon={Times}
                size={'sm'}
                sx={t => ({ marginRight: t.space.$2 })}
              />
            }
            variant='outline'
            colorScheme='danger'
            textVariant='buttonExtraSmallBold'
            onClick={() => navigate('delete')}
            localizationKey={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.title')}
          />
        )}
      </Flex>
    </ProfileSection>
  );
};
