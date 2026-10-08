import { usePasswordSectionModel } from './password-section.model';
import { PasswordScreenView, PasswordSectionView } from './password-section.view';
import { useProfileActionCloseController } from './useProfileActionCloseController';

const PasswordScreen = () => {
  const controller = useProfileActionCloseController();
  return <PasswordScreenView controller={controller} />;
};

export const PasswordSection = () => {
  const model = usePasswordSectionModel();
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <PasswordSectionView
      {...model}
      passwordScreen={<PasswordScreen />}
    />
  );
};
