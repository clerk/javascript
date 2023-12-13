import { useUser } from '@clerk/shared/react';

import { localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { Pencil } from '../../icons';
import { useRouter } from '../../router';
import { AddBlockButton } from './UserProfileBlockButtons';

export const UsernameSection = () => {
  const { user } = useUser();
  const { navigate } = useRouter();

  if (!user) {
    return null;
  }

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.usernameSection.title')}
      id='username'
    >
      {user.username && <Text sx={t => ({ padding: `${t.space.$2} ${t.space.$4}` })}>{user.username}</Text>}
      <AddBlockButton
        id='username'
        onClick={() => navigate('username')}
        leftIcon={user.username ? Pencil : undefined}
        textLocalizationKey={
          user.username
            ? localizationKeys('userProfile.start.usernameSection.primaryButton__changeUsername')
            : localizationKeys('userProfile.start.usernameSection.primaryButton__setUsername')
        }
      />
    </ProfileSection>
  );
};
