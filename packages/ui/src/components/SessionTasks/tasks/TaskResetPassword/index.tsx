import { withCoreSessionSwitchGuard } from '@/ui/contexts';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { withTaskGuardOnlyOnMount } from '../shared';
import { useTaskResetPasswordController } from './task-reset-password.controller';
import { useTaskResetPasswordModel } from './task-reset-password.model';
import { TaskResetPasswordView } from './task-reset-password.view';

const TaskResetPasswordInternal = () => {
  const model = useTaskResetPasswordModel();
  return (
    <TaskResetPasswordContent
      key={model.scopeKey}
      model={model}
    />
  );
};

const TaskResetPasswordContent = withTaskGuardOnlyOnMount(
  withCardStateProvider(({ model }: { model: ReturnType<typeof useTaskResetPasswordModel> }) => {
    const controller = useTaskResetPasswordController(model);
    return <TaskResetPasswordView controller={controller} />;
  }),
  'reset-password',
);

export const TaskResetPassword = withCoreSessionSwitchGuard(TaskResetPasswordInternal);
