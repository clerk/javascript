import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { UserPreview } from '../elements';
import { ProfileSection } from './Section';
import { BlockButton } from './UserProfileBlockButtons';

export const UserProfileSection = () => {
  const user = useCoreUser();

  return (
    <ProfileSection
      title='Profile'
      id='profile'
    >
      <BlockButton>
        <UserPreview
          user={user}
          size='lg'
        />
      </BlockButton>
    </ProfileSection>
  );
};
