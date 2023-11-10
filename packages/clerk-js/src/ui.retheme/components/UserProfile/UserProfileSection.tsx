import { useUser } from '@clerk/shared/react';

import { localizationKeys } from '../../customizables';
import { ProfileSection, UserPreview } from '../../elements';
import { useRouter } from '../../router';
import { BlockButton } from './UserProfileBlockButtons';

export const UserProfileSection = () => {
  const { navigate } = useRouter();
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
      <BlockButton onClick={() => navigate('profile')}>
        <UserPreview
          user={userWithoutIdentifiers}
          size='lg'
        />
      </BlockButton>
    </ProfileSection>
  );
};
