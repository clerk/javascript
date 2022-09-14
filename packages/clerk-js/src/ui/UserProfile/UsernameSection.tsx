import React from 'react';

import { useCoreUser } from '../contexts';
import { localizationKeys, Text } from '../customizables';
import { useNavigate } from '../hooks/useNavigate';
import { ProfileSection } from './Section';
import { AddBlockButton } from './UserProfileBlockButtons';

export const UsernameSection = () => {
  const user = useCoreUser();
  const { navigate } = useNavigate();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.sectionTitle__username')}
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
        textLocalizationKey={
          user.username
            ? localizationKeys('userProfile.sectionPrimaryButton__changeUsername')
            : localizationKeys('userProfile.sectionPrimaryButton__setUsername')
        }
      />
    </ProfileSection>
  );
};
