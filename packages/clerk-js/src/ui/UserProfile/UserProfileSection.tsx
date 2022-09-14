import { UserResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../contexts';
import { localizationKeys } from '../customizables';
import { UserPreview } from '../elements';
import { useNavigate } from '../hooks';
import { ProfileSection } from './Section';
import { BlockButton } from './UserProfileBlockButtons';

export const UserProfileSection = () => {
  const { navigate } = useNavigate();
  const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = useCoreUser();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.sectionTitle__profile')}
      id='profile'
    >
      <BlockButton onClick={() => navigate('profile')}>
        <UserPreview
          user={userWithoutIdentifiers as UserResource}
          size='lg'
        />
      </BlockButton>
    </ProfileSection>
  );
};
