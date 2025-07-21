import { useFetch } from '.';
import { useEnvironment } from '../contexts';

/**
 * Preloads tasks based on the environment settings
 * @internal
 */
export function usePreloadTasks() {
  const { organizationSettings } = useEnvironment();

  const hasTasks = organizationSettings.forceOrganizationSelection;

  void useFetch(
    hasTasks ? () => import(/* webpackChunkName: "sessionTasks" */ '../components/CurrentTask') : undefined,
    'preloadComponent',
    {
      staleTime: Infinity,
    },
  );
}
