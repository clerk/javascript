import { useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { Button, localizationKeys } from '../../customizables';
import { ProfileSection, UserPreview } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { mqu } from '../../styledSystem';
import { ProfileForm } from './ProfileForm';

const ProfileScreen = () => {
  const { close } = useActionContext();
  return (
    <ProfileForm
      onSuccess={close}
      onReset={close}
    />
  );
};

export const UserProfileSection = () => {
  const { user } = useUser();
  const [action, setAction] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.profileSection.title')}
      id='profile'
      willGrow={action === 'edit'}
      headerSx={{
        height: '100%',
        justifyContent: 'center',
      }}
      sx={{ alignItems: 'center', [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <Action.Root
        action={action}
        onActionChange={setAction}
      >
        <Action.Closed value='edit'>
          <ProfileSection.Item
            id='profile'
            sx={t => ({
              padding: `${t.space.$1x5} ${t.space.$none} ${t.space.$1x5} ${t.space.$3}`,
            })}
          >
            <UserPreview
              user={userWithoutIdentifiers}
              size='lg'
              mainIdentifierVariant='subtitle'
              sx={t => ({ color: t.colors.$blackAlpha700 })}
            />

            <Action.Trigger value='edit'>
              <Button
                id='profile'
                variant='ghost'
                textVariant='buttonSmall'
                localizationKey={localizationKeys('userProfile.start.profileSection.primaryButton')}
              />
            </Action.Trigger>
          </ProfileSection.Item>
        </Action.Closed>

        <Action.Open value='edit'>
          <Action.Card>
            <ProfileScreen />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};
