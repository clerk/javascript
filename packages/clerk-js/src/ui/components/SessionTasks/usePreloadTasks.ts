import { useEnvironment } from '../../../ui/contexts';
import { useFetch } from '../../../ui/hooks';
import { preloadOrganizationSelectionTask } from './lazyTasks';

/**
 * Preloads tasks based on the environment settings
 * @internal
 */
export function usePreloadTasks() {
  const { organizationSettings } = useEnvironment();

  if (organizationSettings.forceOrganizationSelection) {
    void useFetch(preloadOrganizationSelectionTask, 'preloadComponent', { staleTime: Infinity });
  }
}
