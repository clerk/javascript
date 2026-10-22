import { useConfirmController } from '../../../blocks/confirm';
import { useUserProfileDeleteActions, useUserProfileDeleteDisplay } from './user-profile-danger-section.model';
import { UserProfileDangerSectionView } from './user-profile-danger-section.view';

export type UserProfileDangerSectionProps = { fallback?: React.ReactNode };

export function UserProfileDangerSection(props: UserProfileDangerSectionProps) {
  const display = useUserProfileDeleteDisplay();
  const actions = useUserProfileDeleteActions();
  const controller = useConfirmController({ onConfirm: actions.onDelete, reverification: actions.reverification });
  if (!display.isLoaded) {
    return props.fallback ?? null;
  }
  if (!display.visible) {
    return null;
  }
  return <UserProfileDangerSectionView controller={actions.ready ? controller : undefined} />;
}
