import { Button } from '@clerk/mosaic/components/button';
import type { UserProfileManagedBy } from '@clerk/mosaic/features/user-profile/user-profile-managed-by';
import { useUserProfileEditNameController } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-edit-name.controller';
import type { UserProfileEditNameValue } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-edit-name.dialog';
import { UserProfileEditNameDialog } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-edit-name.dialog';
import { useUserProfileEditUsernameController } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-edit-username.controller';
import { UserProfileEditUsernameDialog } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-edit-username.dialog';
import { useUserProfilePictureController } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-picture.controller';
import type { UserProfileProfileSectionViewProps } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-profile-section.types';
import { useMessages } from '@clerk/mosaic/localization';
import type { FormError } from '@clerk/mosaic/utils/errors';
import { SaveError } from '@clerk/mosaic/utils/errors';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName } from '@/lib/chaos';

import { usePreviewImage } from './use-preview-image';

export interface UserProfileProfileFixtureOptions {
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  nameManagedBy?: UserProfileManagedBy;
  latency?: number;
  /** Fails every name save instead of committing it. */
  nameFailWith?: FormError;
  usernameFailWith?: FormError;
}

export function useUserProfileProfileFixture({
  firstName: initialFirstName = 'Preston',
  lastName: initialLastName = 'Booth',
  username: initialUsername = 'prestonxyz',
  imageUrl: initialImageUrl = 'https://avatars.githubusercontent.com/u/51144033?v=4',
  nameManagedBy,
  latency = 800,
  nameFailWith,
  usernameFailWith,
}: UserProfileProfileFixtureOptions = {}): UserProfileProfileSectionViewProps {
  const m = useMessages('userProfileProfileSection');
  const seed = useChaosFixture({ firstName: initialFirstName, lastName: initialLastName }, () => ({
    firstName: chaosName(0),
    lastName: chaosName(7),
  }));
  const [value, setValue] = useState<UserProfileEditNameValue>(seed);
  const usernameSeed = useChaosFixture(initialUsername, () => chaosName(7).toLowerCase());
  const [username, setUsername] = useState(usernameSeed);
  const name = [value.firstName, value.lastName].filter(Boolean).join(' ');
  const { imageUrl, showFile, clearImage } = usePreviewImage(initialImageUrl);
  const picture = useUserProfilePictureController({ onChange: showFile, onRemove: clearImage });
  const editName = useUserProfileEditNameController({
    ...value,
    onSubmit: async next => {
      await new Promise(resolve => setTimeout(resolve, latency));
      if (nameFailWith) {
        throw new SaveError(nameFailWith);
      }
      setValue(next);
    },
  });
  const editUsername = useUserProfileEditUsernameController({
    username,
    onSubmit: async next => {
      await new Promise(resolve => setTimeout(resolve, latency));
      if (usernameFailWith) {
        throw new SaveError(usernameFailWith);
      }
      setUsername(next);
    },
  });

  return {
    name,
    imageUrl,
    hasImage: Boolean(imageUrl),
    showName: true,
    nameManagedBy,
    nameAction: nameManagedBy ? undefined : (
      <UserProfileEditNameDialog
        form={editName.form}
        open={editName.isOpen}
        onOpenChange={editName.onOpenChange}
        title={name ? m.name.dialogTitle : m.name.addDialogTitle}
        trigger={
          <Button
            color='neutral'
            size='sm'
            variant='outline'
          >
            {name ? m.name.edit : m.name.add}
          </Button>
        }
      />
    ),
    showUsername: true,
    username,
    usernameAction: (
      <UserProfileEditUsernameDialog
        form={editUsername.form}
        open={editUsername.isOpen}
        onOpenChange={editUsername.onOpenChange}
        title={username ? m.username.dialogTitle : m.username.addDialogTitle}
        trigger={
          <Button
            color='neutral'
            size='sm'
            variant='outline'
          >
            {username ? m.username.edit : m.username.add}
          </Button>
        }
      />
    ),
    picture,
  };
}
