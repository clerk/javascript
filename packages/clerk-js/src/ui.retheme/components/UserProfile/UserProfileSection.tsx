import { useUser } from '@clerk/shared/react';

import { Button, descriptors, Flex, localizationKeys } from '../../customizables';
import { ProfileSection, UserPreview } from '../../elements';

export const UserProfileSection = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.profileSection.title')}
      id='profile'
    >
      <Flex
        elementDescriptor={descriptors.profileSection}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <UserPreview
          user={userWithoutIdentifiers}
          size='lg'
        />

        <Button
          variant='ghost'
          localizationKey={localizationKeys('userProfile.start.profileSection.primaryButton')}
        />
      </Flex>
    </ProfileSection>
  );
};
