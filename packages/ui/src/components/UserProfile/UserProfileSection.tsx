import { useProfileActionCloseController } from './useProfileActionCloseController';
import { useUserProfileSectionModel } from './user-profile-section.model';
import { ProfileScreenView, UserProfileSectionView } from './user-profile-section.view';

const ProfileScreen = () => {
  const controller = useProfileActionCloseController();
  return <ProfileScreenView controller={controller} />;
};

export const UserProfileSection = () => {
  const model = useUserProfileSectionModel();
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <UserProfileSectionView
      {...model}
      profileScreen={<ProfileScreen />}
    />
  );
};
