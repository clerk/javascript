import { useProfileActionCloseController } from './useProfileActionCloseController';
import { type UsernameSectionProps, useUsernameSectionModel } from './username-section.model';
import { UsernameScreenView, UsernameSectionView } from './username-section.view';

const UsernameScreen = () => {
  const controller = useProfileActionCloseController();
  return <UsernameScreenView controller={controller} />;
};

export const UsernameSection = (props: UsernameSectionProps) => {
  const model = useUsernameSectionModel(props);
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <UsernameSectionView
      {...model}
      usernameScreen={<UsernameScreen />}
    />
  );
};
