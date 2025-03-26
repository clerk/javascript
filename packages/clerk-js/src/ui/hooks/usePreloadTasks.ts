import { useEnvironment } from '../contexts';
import { useFetch } from '.';

/**
 * Preloads tasks based on the environment settings
 * @internal
 */
export function usePreloadTasks() {
  const { organizationSettings } = useEnvironment();

  const hasTasks = organizationSettings.forceOrganizationSelection;

  void useFetch(
    hasTasks ? () => import(/* webpackChunkName: "sessionTasks" */ '../components/SessionTasks') : undefined,
    'preloadComponent',
    {
      staleTime: Infinity,
    },
  );
}
