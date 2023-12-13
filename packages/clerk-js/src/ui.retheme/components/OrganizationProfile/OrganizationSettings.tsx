import { useOrganization } from '@clerk/shared/react';

import { AddBlockButton, BlockButton, Gate, useGate } from '../../common';
import { useEnvironment } from '../../contexts';
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
            textVariant='h1'
          />
        </Header.Root>
        <OrganizationProfileSection />
        <Gate permission='org:sys_domains:read'>
          <OrganizationDomainsSection />
        </Gate>
        <OrganizationDangerSection />
      </Col>
    </Col>
  );
};

const OrganizationProfileSection = () => {
  const { organization } = useOrganization();
  const { navigate } = useRouter();

  if (!organization) {
    return null;
  }

  const profile = <OrganizationPreview organization={organization} />;

  return (
    <ProfileSection
      title={localizationKeys('organizationProfile.profilePage.title')}
      id='organizationProfile'
    >
      <Gate
        permission={'org:sys_profile:manage'}
        fallback={<>{profile}</>}
      >
        <BlockButton onClick={() => navigate('profile')}>{profile}</BlockButton>
      </Gate>
    </ProfileSection>
  );
};

const OrganizationDomainsSection = () => {
  const { organizationSettings } = useEnvironment();
  const { organization } = useOrganization();

  const { navigate } = useRouter();

  if (!organizationSettings || !organization) {
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
      <DomainList redirectSubPath={'domain'} />

      <Gate permission='org:sys_domains:manage'>
        <AddBlockButton
          textLocalizationKey={localizationKeys('organizationProfile.profilePage.domainSection.primaryButton')}
          id='addOrganizationDomain'
          onClick={() => navigate('domain')}
        />
      </Gate>
    </ProfileSection>
  );
};

const OrganizationDangerSection = () => {
  const { organization } = useOrganization();
  const { navigate } = useRouter();
  const { isAuthorizedUser: canDeleteOrganization } = useGate({ permission: 'org:sys_profile:delete' });

  if (!organization) {
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
          variant='secondaryDanger'
          textVariant='buttonSmall'
          onClick={() => navigate('leave')}
          localizationKey={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
        />
        {canDeleteOrganization && adminDeleteEnabled && (
          <IconButton
            aria-label='Delete organization'
            icon={
              <Icon
                icon={Times}
                size={'sm'}
                sx={t => ({ marginRight: t.space.$2 })}
              />
            }
            variant='secondaryDanger'
            textVariant='buttonSmall'
            onClick={() => navigate('delete')}
            localizationKey={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.title')}
          />
        )}
      </Flex>
    </ProfileSection>
  );
};
