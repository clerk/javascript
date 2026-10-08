import { withCardStateProvider } from '@/ui/elements/contexts';

import { useTaskChooseOrganizationFlowsController } from './task-choose-organization.controller';
import type { OrganizationCreationDefaultsData, TaskChooseOrganizationFlow } from './task-choose-organization.types';
import { TaskChooseOrganizationFlowsView } from './task-choose-organization-flows.view';

type TaskChooseOrganizationFlowsProps = {
  initialFlow: TaskChooseOrganizationFlow;
  organizationCreationDefaults?: OrganizationCreationDefaultsData | null;
};

export const TaskChooseOrganizationFlows = withCardStateProvider((props: TaskChooseOrganizationFlowsProps) => {
  const controller = useTaskChooseOrganizationFlowsController(props.initialFlow);
  return (
    <TaskChooseOrganizationFlowsView
      {...controller}
      organizationCreationDefaults={props.organizationCreationDefaults}
    />
  );
});
