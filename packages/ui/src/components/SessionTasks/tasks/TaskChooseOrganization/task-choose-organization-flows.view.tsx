import { ChooseOrganizationScreen } from './ChooseOrganizationScreen';
import { CreateOrganizationScreen } from './CreateOrganizationScreen';
import type { TaskChooseOrganizationFlowsViewProps } from './task-choose-organization.types';

export const TaskChooseOrganizationFlowsView = ({
  currentFlow,
  onCancel,
  onCreateOrganizationClick,
  organizationCreationDefaults,
}: TaskChooseOrganizationFlowsViewProps) => {
  if (currentFlow === 'create') {
    return (
      <CreateOrganizationScreen
        onCancel={onCancel}
        organizationCreationDefaults={organizationCreationDefaults}
      />
    );
  }

  return <ChooseOrganizationScreen onCreateOrganizationClick={onCreateOrganizationClick} />;
};
