import { useUser } from '@clerk/shared/react';

import { Button, Flex, localizationKeys } from '../../customizables';
import { ProfileSection, UserPreview } from '../../elements';
import { Action } from '../../elements/Action';
import { ProfileForm } from './ProfileForm';

export const UserProfileSection = () => {
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
      <Action.Root>
        <Action.Closed value='edit'>
          <Flex
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <UserPreview user={userWithoutIdentifiers} />

            <Action.Trigger value='edit'>
              <Button
                variant='ghost'
                localizationKey={localizationKeys('userProfile.start.profileSection.primaryButton')}
              />
            </Action.Trigger>
          </Flex>
        </Action.Closed>

        <Action.Open value='edit'>
          <Action.Card>
            <ProfileForm />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection>
  );
};
