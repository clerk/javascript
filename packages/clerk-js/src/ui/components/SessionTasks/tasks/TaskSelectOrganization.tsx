import { withCoreSessionSwitchGuard } from '@/ui/contexts';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { withTaskGuard } from './withTaskGuard';

const TaskSelectOrganizationInternal = () => {
  return <p>TODO - build UI</p>;
};

export const TaskSelectOrganization = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskSelectOrganizationInternal)),
);
