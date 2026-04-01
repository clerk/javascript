import { useUser } from '@clerk/shared/react';

import { ProfileSection } from '@/ui/elements/Section';
import { UserPreview } from '@/ui/elements/UserPreview';

import { localizationKeys } from '../../customizables';
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

  if (!user) {
    return null;
  }

  const { username, primaryEmailAddress, primaryPhoneNumber, primaryWeb3Wallet, ...userWithoutIdentifiers } = user;

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.profileSection.title')}
      id='profile'
      sx={{ [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <Action.Root>
        <Action.Closed value='edit'>
          <ProfileSection.Item id='profile'>
            <UserPreview
              user={userWithoutIdentifiers}
              size='lg'
              mainIdentifierVariant='subtitle'
              sx={t => ({ color: t.colors.$colorForeground })}
            />

            <Action.Trigger value='edit'>
              <ProfileSection.Button
                id='profile'
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
