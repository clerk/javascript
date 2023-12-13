import { useUser } from '@clerk/shared/react';

import { Button, descriptors, Flex, localizationKeys } from '../../customizables';
import { ProfileSection, UserPreview } from '../../elements';
import { Action } from '../../elements/Action';
import { UpdateProfileForm } from './UpdateProfileForm';

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
        <Action.Closed>
          <Flex
            elementDescriptor={descriptors.profileSection}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <UserPreview user={userWithoutIdentifiers} />

            <Action.Trigger>
              <Button
                variant='ghost'
                localizationKey={localizationKeys('userProfile.start.profileSection.primaryButton')}
              />
            </Action.Trigger>
          </Flex>
        </Action.Closed>

        <Action.Open>
          <Action.Card>
            <UpdateProfileForm />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection>
  );
};
