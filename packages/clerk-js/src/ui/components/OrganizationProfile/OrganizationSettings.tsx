import React from 'react';

import { useCoreOrganization, useCoreUser } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys } from '../../customizables';
import { Header, IconButton, NavbarMenuButtonRow, OrganizationPreview } from '../../elements';
import { useNavigate } from '../../hooks';
import { Times } from '../../icons';
import { ProfileSection } from '../UserProfile/Section';
import { BlockButton } from '../UserProfile/UserProfileBlockButtons';

export const OrganizationSettings = () => {
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
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('organizationProfile.start.headerTitle__settings')}
            textVariant='xxlargeMedium'
          />
          <Header.Subtitle
            // localizationKey={localizationKeys('organizationProfile.start.headerSubtitle__account')}
            localizationKey={'Manage organization settings'}
          />
        </Header.Root>
        <OrganizationProfileSection />
        <OrganizationDangerSection />
      </Col>
    </Col>
  );
};

const OrganizationProfileSection = () => {
  const { organization, membership } = useCoreOrganization();
  const { navigate } = useNavigate();
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
      // title={localizationKeys('userProfile.start.profileSection.title')}
      title={'Organization profile'}
      // id='organization-profile'
    >
      {isAdmin ? <BlockButton onClick={() => navigate('profile')}>{profile}</BlockButton> : profile}
    </ProfileSection>
  );
};

const OrganizationDangerSection = () => {
  const { organization, membership } = useCoreOrganization();
  const user = useCoreUser();

  if (!organization || !membership) {
    return null;
  }

  const leave = () => {
    return organization.removeMember(user.id);
  };

  return (
    <ProfileSection
      // title={localizationKeys('userProfile.start.profileSection.title')}
      // id='organization-danger'
      title={'Danger'}
      sx={t => ({ marginBottom: t.space.$4 })}
    >
      <Flex gap={4}>
        <IconButton
          icon={Times}
          variant='outline'
          colorScheme='danger'
          textVariant='buttonExtraSmallBold'
          onClick={leave}
          isDisabled={membership.role === 'admin'}
        >
          Leave organization
        </IconButton>
      </Flex>
    </ProfileSection>
  );
};
