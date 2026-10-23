import { Button } from '../../components/button';
import { UserProfileProfileSectionView } from '../../features/user-profile/user-profile-profile-section/user-profile-profile-section.view';
import { useMessages } from '../../localization';
import { useLoomProfileDetailsModel } from './loom-profile-details.model';

export function LoomProfileDetails() {
  const model = useLoomProfileDetailsModel();
  const m = useMessages('userProfileProfileSection');
  return (
    <UserProfileProfileSectionView
      name={model.name}
      imageUrl={model.imageUrl}
      hasImage={model.hasImage}
      showName={model.firstNameAttribute.enabled !== false || model.lastNameAttribute.enabled !== false}
      nameManagedBy={model.nameManagedBy}
      nameAction={model.eligibility.canEditName ? (
        <Button color='neutral' size='sm' variant='outline' disabled>
          {model.name ? m.name.edit : m.name.add}
        </Button>
      ) : undefined}
      showUsername={model.showUsername}
      username={model.username}
      usernameAction={model.eligibility.canEditUsername ? (
        <Button color='neutral' size='sm' variant='outline' disabled>
          {model.username ? m.username.edit : m.username.add}
        </Button>
      ) : undefined}
      eligibility={model.eligibility}
    />
  );
}
