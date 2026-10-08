import { useClerk, useReverification, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import type { RemoveFormProps, RemoveResourceModel } from './remove-resource.types';

export type { RemoveFormProps } from './remove-resource.types';

export const useRemoveResourceModel = (
  deleteResource: RemoveFormProps['deleteResource'],
  options: Pick<RemoveFormProps, 'scopeKey' | 'canRun'> = {},
): RemoveResourceModel => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const identity = JSON.stringify([actor, sessionId, clientId, options.scopeKey]);
  const current = useRef({ identity, version: 0, clerk, generation: {} });
  if (current.current.identity !== identity || current.current.clerk !== clerk) {
    current.current = { identity, version: current.current.version + 1, clerk, generation: {} };
  }
  const owner = current.current;
  const scopeKey = JSON.stringify([identity, owner.version]);
  const mounted = useRef(true);
  const latest = useRef<{ deleteResource: typeof deleteResource; canRun: typeof options.canRun }>();
  latest.current = { deleteResource, canRun: options.canRun };
  useSafeLayoutEffect(() => {
    mounted.current = true;
    latest.current = { deleteResource, canRun: options.canRun };
    return () => {
      mounted.current = false;
      owner.generation = {};
      latest.current = undefined;
    };
  }, [owner]);
  const canRun = () =>
    mounted.current &&
    current.current === owner &&
    !!actor &&
    !!sessionId &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    (latest.current?.canRun?.() ?? true);
  const deleteWithReverification = useReverification(
    async (effect: RemoveFormProps['deleteResource'], isCurrent: () => boolean) => {
      if (!isCurrent()) {
        return false;
      }
      try {
        const result = await effect(isCurrent);
        return isCurrent() ? result : false;
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
  );

  return {
    scopeKey,
    canRun,
    deleteResource: async (canContinue = () => true) => {
      const generation = owner.generation;
      const isCurrent = () => canRun() && owner.generation === generation && canContinue();
      const effect = latest.current?.deleteResource;
      if (!effect || !isCurrent()) {
        return false;
      }
      try {
        return (await deleteWithReverification(effect, isCurrent)) !== false && isCurrent();
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
  };
};
