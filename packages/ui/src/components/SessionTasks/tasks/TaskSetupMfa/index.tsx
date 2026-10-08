import { withCoreSessionSwitchGuard } from '@/ui/contexts';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { withTaskGuardOnlyOnMount } from '../shared';
import { useTaskSetupMfaController } from './task-setup-mfa.controller';
import { useTaskSetupMfaModel } from './task-setup-mfa.model';
import { TaskSetupMfaView } from './task-setup-mfa.view';

const TaskSetupMFAInternal = () => {
  const model = useTaskSetupMfaModel();
  const controller = useTaskSetupMfaController(model);
  return <TaskSetupMfaView controller={controller} />;
};

export const TaskSetupMFA = withCoreSessionSwitchGuard(
  withTaskGuardOnlyOnMount(withCardStateProvider(TaskSetupMFAInternal), 'setup-mfa'),
);
