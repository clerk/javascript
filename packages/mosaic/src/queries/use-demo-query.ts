import { ClerkRuntimeError } from '@clerk/shared/error';
import {
  __internal_createCacheKeys,
  __internal_useClearQueriesOnSignOut,
  __internal_useClerkMutation,
  __internal_useClerkQuery,
  getClerkQueryClient,
  useClerk,
  useSession,
} from '@clerk/shared/react';

import { useMosaicRequest } from '../hooks/use-mosaic-request';
import { getDemoInstance, updateDemoInstance, type UpdateDemoParams } from './demo.requests';

function useDemoScope() {
  const clerk = useClerk();
  const { session, isLoaded } = useSession();
  const sessionId = session?.id;
  const keys = __internal_createCacheKeys({
    stablePrefix: 'mosaic-demo',
    authenticated: true,
    tracked: { publishableKey: clerk.publishableKey, sessionId },
    untracked: { args: {} },
  });

  __internal_useClearQueriesOnSignOut({
    isSignedOut: session === null,
    authenticated: true,
    stableKeys: keys.stableKey,
  });

  return {
    ...keys,
    enabled: isLoaded && clerk.loaded && Boolean(sessionId),
    isCurrent: () => Boolean(sessionId) && clerk.session?.id === sessionId,
  };
}

export function useDemoQuery() {
  const request = useMosaicRequest();
  const { queryKey, enabled } = useDemoScope();

  return __internal_useClerkQuery({
    queryKey,
    enabled,
    retry: false,
    queryFn: ({ signal }) => getDemoInstance(request, { signal }),
  });
}

export function useUpdateDemo() {
  const request = useMosaicRequest();
  const { queryKey, enabled, isCurrent } = useDemoScope();
  const client = getClerkQueryClient();

  return __internal_useClerkMutation({
    mutationKey: [...queryKey, 'update'],
    retry: false,
    mutationFn: (params: UpdateDemoParams) => {
      if (!enabled || !isCurrent()) {
        throw new ClerkRuntimeError('The active session changed.', { code: 'mosaic_demo_session_changed' });
      }
      return updateDemoInstance(request, params);
    },
    onSuccess: async data => {
      if (!isCurrent()) {
        return;
      }
      await client?.cancelQueries({ queryKey, exact: true });
      if (!isCurrent()) {
        return;
      }
      client?.setQueryData(queryKey, data);
      await client?.invalidateQueries({ queryKey, exact: true });
    },
  });
}
