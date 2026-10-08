import { withCoreSessionSwitchGuard } from '@/ui/contexts';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { withTaskGuard } from '../shared';
import { useTaskChooseOrganizationController } from './task-choose-organization.controller';
import { useTaskChooseOrganizationModel } from './task-choose-organization.model';
import type { TaskChooseOrganizationData } from './task-choose-organization.types';
import { TaskChooseOrganizationView } from './task-choose-organization.view';

const TaskChooseOrganizationContent = withCardStateProvider(({ model }: { model: TaskChooseOrganizationData }) => {
  const controller = useTaskChooseOrganizationController(model);
  return <TaskChooseOrganizationView {...controller} />;
});

const TaskChooseOrganizationInternal = () => {
  const model = useTaskChooseOrganizationModel();
  return (
    <TaskChooseOrganizationContent
      key={model.scopeKey}
      model={model}
    />
  );
};

export const TaskChooseOrganization = withCoreSessionSwitchGuard(
  withTaskGuard(TaskChooseOrganizationInternal, 'choose-organization'),
);
