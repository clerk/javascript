import { Button } from '../../../components/button';
import { useMessages } from '../../../localization';
import type { UserProfileEditNameControllerOptions } from './user-profile-edit-name.controller';
import { useUserProfileEditNameController } from './user-profile-edit-name.controller';
import { UserProfileEditNameDialog } from './user-profile-edit-name.dialog';
import type { UserProfileEditUsernameControllerOptions } from './user-profile-edit-username.controller';
import { useUserProfileEditUsernameController } from './user-profile-edit-username.controller';
import { UserProfileEditUsernameDialog } from './user-profile-edit-username.dialog';
import { useUserProfilePictureController } from './user-profile-picture.controller';
import { useUserProfileProfileSectionModel } from './user-profile-profile-section.model';
import type { ReadyProfileSectionModel, UserProfileNameAttribute } from './user-profile-profile-section.types';
import { UserProfileProfileSectionView } from './user-profile-profile-section.view';

export function UserProfileProfileSection() {
  const model = useUserProfileProfileSectionModel();

  if (model.status !== 'ready') {
    return null;
  }

  return (
    <Profile
      key={model.userId}
      model={model}
    />
  );
}

function Profile({ model }: { model: ReadyProfileSectionModel }) {
  const picture = useUserProfilePictureController({
    onChange: model.onProfilePictureChange,
    onRemove: model.onRemoveProfilePicture,
  });

  return (
    <UserProfileProfileSectionView
      name={model.name}
      imageUrl={model.imageUrl}
      hasImage={model.hasImage}
      showName={model.firstNameAttribute.enabled !== false || model.lastNameAttribute.enabled !== false}
      nameManagedBy={model.nameManagedBy}
      nameAction={
        model.onSubmitName ? (
          <EditName
            isSet={Boolean(model.name)}
            firstName={model.firstName}
            lastName={model.lastName}
            firstNameAttribute={model.firstNameAttribute}
            lastNameAttribute={model.lastNameAttribute}
            onSubmit={model.onSubmitName}
          />
        ) : undefined
      }
      showUsername={model.showUsername}
      username={model.username}
      usernameAction={
        model.onSubmitUsername ? (
          <EditUsername
            username={model.username}
            required={model.usernameRequired}
            onSubmit={model.onSubmitUsername}
          />
        ) : undefined
      }
      picture={picture}
    />
  );
}

function EditName({
  isSet,
  firstNameAttribute,
  lastNameAttribute,
  ...options
}: UserProfileEditNameControllerOptions & {
  isSet: boolean;
  firstNameAttribute: UserProfileNameAttribute;
  lastNameAttribute: UserProfileNameAttribute;
}) {
  const m = useMessages('userProfileProfileSection');
  const controller = useUserProfileEditNameController(options);

  return (
    <UserProfileEditNameDialog
      form={controller.form}
      firstNameAttribute={firstNameAttribute}
      lastNameAttribute={lastNameAttribute}
      open={controller.isOpen}
      onOpenChange={controller.onOpenChange}
      title={isSet ? m.name.dialogTitle : m.name.addDialogTitle}
      trigger={
        <Button
          color='neutral'
          size='sm'
          variant='outline'
        >
          {isSet ? m.name.edit : m.name.add}
        </Button>
      }
    />
  );
}

function EditUsername(options: UserProfileEditUsernameControllerOptions) {
  const m = useMessages('userProfileProfileSection');
  const controller = useUserProfileEditUsernameController(options);
  const isSet = Boolean(options.username);

  return (
    <UserProfileEditUsernameDialog
      form={controller.form}
      open={controller.isOpen}
      onOpenChange={controller.onOpenChange}
      title={isSet ? m.username.dialogTitle : m.username.addDialogTitle}
      trigger={
        <Button
          color='neutral'
          size='sm'
          variant='outline'
        >
          {isSet ? m.username.edit : m.username.add}
        </Button>
      }
    />
  );
}
