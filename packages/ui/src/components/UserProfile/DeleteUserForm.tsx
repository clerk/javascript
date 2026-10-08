import { withCardStateProvider } from '@/ui/elements/contexts';

import { useDeleteUserController } from './delete-user.controller';
import type { DeleteUserFormProps } from './delete-user.model';
import { useDeleteUserModel } from './delete-user.model';
import { DeleteUserView } from './delete-user.view';

export const DeleteUserForm = withCardStateProvider((props: DeleteUserFormProps) => {
  const model = useDeleteUserModel();
  const controller = useDeleteUserController(model, props);

  return <DeleteUserView controller={controller} />;
});
