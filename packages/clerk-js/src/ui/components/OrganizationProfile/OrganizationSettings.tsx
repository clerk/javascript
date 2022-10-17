import React from 'react';

import { useCoreUser, useEnvironment } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys } from '../../customizables';
import { Header, IconButton, NavbarMenuButtonRow, UserPreview } from '../../elements';
import { useNavigate } from '../../hooks';
import { Times, Trash } from '../../icons';
import { ProfileSection } from '../UserProfile/Section';
import { BlockButton } from '../UserProfile/UserProfileBlockButtons';

export const OrganizationSettings = () => {
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
        <Header.Root id='cl-section-settings'>
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
  const { navigate } = useNavigate();
  const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = useCoreUser();

  return (
    <ProfileSection
      // title={localizationKeys('userProfile.start.profileSection.title')}
      title={'Organization profile'}
      // id='organization-profile'
    >
      <BlockButton onClick={() => navigate('profile')}>
        {/*// TODO*/}
        <UserPreview
          user={userWithoutIdentifiers}
          size='lg'
        />
      </BlockButton>
    </ProfileSection>
  );
};

const OrganizationDangerSection = () => {
  const { navigate } = useNavigate();

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
        >
          Leave organization
        </IconButton>
        <IconButton
          icon={Trash}
          variant='outline'
          colorScheme='danger'
          textVariant='buttonExtraSmallBold'
        >
          Delete organization
        </IconButton>
      </Flex>
    </ProfileSection>
  );
};
