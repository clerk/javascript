import { useClerk } from '@clerk/shared/react/index';

import { useFetch } from '.';

/**
 * Preloads `<CurrentTask />` component based on the environment settings
 * @internal
 */
export function usePreloadCurrentTask() {
  const { __internal_hasAfterAuthFlows } = useClerk();

  void useFetch(
    __internal_hasAfterAuthFlows
      ? () => import(/* webpackChunkName: "currentTask" */ '../components/CurrentTask')
      : undefined,
    'preloadComponent',
    {
      staleTime: Infinity,
    },
  );
}
