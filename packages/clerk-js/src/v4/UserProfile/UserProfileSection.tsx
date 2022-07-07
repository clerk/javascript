import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { UserPreview } from '../elements';
import { ProfileSection } from './Section';
import { BlockButton } from './UserProfileBlockButtons';

export const UserProfileSection = () => {
  const { navigate } = useNavigate();
  const user = useCoreUser();

  return (
    <ProfileSection
      title='Profile'
      id='profile'
    >
      <BlockButton onClick={() => navigate('profile')}>
        <UserPreview
          user={user}
          size='lg'
        />
      </BlockButton>
    </ProfileSection>
  );
};
