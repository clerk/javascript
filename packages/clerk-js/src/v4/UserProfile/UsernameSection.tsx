import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks/useNavigate';
import { ProfileSection } from './Section';
import { BlockButton } from './UserProfileBlockButtons';

export const UsernameSection = () => {
  const user = useCoreUser();
  const { navigate } = useNavigate();

  return (
    <ProfileSection
      title='Username'
      id='username'
    >
      <BlockButton onClick={() => navigate('username')}>{user.username}</BlockButton>
    </ProfileSection>
  );
};
