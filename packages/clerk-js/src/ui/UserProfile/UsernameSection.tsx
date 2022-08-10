import React from 'react';

import { useCoreUser } from '../contexts';
import { useNavigate } from '../hooks/useNavigate';
import { Text } from '../customizables';
import { ProfileSection } from './Section';
import { AddBlockButton } from './UserProfileBlockButtons';

export const UsernameSection = () => {
  const user = useCoreUser();
  const { navigate } = useNavigate();

  return (
    <ProfileSection
      title='Username'
      id='username'
    >
      {user.username && (
        <Text
          variant='smallRegular'
          sx={t => ({ padding: `${t.space.$2} ${t.space.$4}` })}
        >
          {user.username}
        </Text>
      )}
      <AddBlockButton
        id='username'
        onClick={() => navigate('username')}
      >
        {user.username ? 'Change username' : 'Set username'}
      </AddBlockButton>
    </ProfileSection>
  );
};
