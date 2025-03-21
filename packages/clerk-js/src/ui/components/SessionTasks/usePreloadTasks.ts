import { useEnvironment } from '../../../ui/contexts';
import { preloadOrganizationSelectionTask } from './lazySessionTasks';

/**
 * Preloads tasks based on the environment settings
 * @internal
 */
export function usePreloadTasks() {
  const { organizationSettings } = useEnvironment();

  if (organizationSettings.forceOrganizationSelection) {
    void preloadOrganizationSelectionTask();
  }
}
