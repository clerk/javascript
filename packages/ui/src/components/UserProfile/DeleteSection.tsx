import { DeleteSectionView, DeleteUserScreenView } from './delete-section.view';
import { useProfileActionCloseController } from './useProfileActionCloseController';

const DeleteUserScreen = () => {
  const controller = useProfileActionCloseController();
  return <DeleteUserScreenView {...controller} />;
};

export const DeleteSection = () => <DeleteSectionView form={<DeleteUserScreen />} />;
