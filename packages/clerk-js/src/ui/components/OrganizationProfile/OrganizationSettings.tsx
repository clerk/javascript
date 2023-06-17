import { useCoreOrganization } from '../../contexts';
import { Col, descriptors, Flex, Icon, localizationKeys } from '../../customizables';
import { Header, IconButton, NavbarMenuButtonRow, OrganizationPreview, ProfileSection } from '../../elements';
import { Times } from '../../icons';
import { useRouter } from '../../router';
import { BlockButton } from '../UserProfile/UserProfileBlockButtons';

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

const OrganizationDangerSection = () => {
  const { organization, membership } = useCoreOrganization();
  const { navigate } = useRouter();

  if (!organization || !membership) {
    return null;
  }

  const adminDeleteEnabled = organization.adminDeleteEnabled;

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
          isDisabled={membership.role === 'admin'}
          localizationKey={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
        />
        {membership.role === 'admin' && adminDeleteEnabled && (
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
