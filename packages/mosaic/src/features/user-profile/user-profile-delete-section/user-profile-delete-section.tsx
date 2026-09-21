import type { UserProfileDeleteSectionControllerOptions } from './user-profile-delete-section.controller';
import { useUserProfileDeleteSectionController } from './user-profile-delete-section.controller';
import { UserProfileDeleteSectionView } from './user-profile-delete-section.view';

export type UserProfileDeleteSectionProps = UserProfileDeleteSectionControllerOptions;

export function UserProfileDeleteSection(props: UserProfileDeleteSectionProps) {
  const controller = useUserProfileDeleteSectionController(props);

  return <UserProfileDeleteSectionView {...controller} />;
}
