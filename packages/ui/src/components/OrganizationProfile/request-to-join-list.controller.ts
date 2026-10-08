import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { RequestToJoinListData, RequestToJoinListModel } from './request-to-join-list.types';

type RequestAction = 'accept' | 'reject';

export const useRequestToJoinListController = (model: RequestToJoinListModel): RequestToJoinListData => {
  const card = useCardState();
  const [pendingRows, setPendingRows] = useState<Record<string, RequestAction>>({});
  const pendingActions = useRef(new Map<string, Promise<void>>());
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const run = (id: string, action: RequestAction, effect: () => Promise<void>): Promise<void> => {
    if (!model.canAct || !isMounted.current) {
      return Promise.resolve();
    }
    const existing = pendingActions.current.get(id);
    if (existing) {
      return existing;
    }
    setPendingRows(rows => ({ ...rows, [id]: action }));
    card.setError(undefined);
    const pending = (async () => effect())()
      .catch(error => {
        if (isMounted.current) {
          handleError(error, [], card.setError);
        }
      })
      .finally(() => {
        pendingActions.current.delete(id);
        if (isMounted.current) {
          setPendingRows(rows => {
            const next = { ...rows };
            delete next[id];
            return next;
          });
        }
      });
    pendingActions.current.set(id, pending);
    return pending;
  };

  return {
    table: model.table,
    requests: model.requests.map(request => {
      const action = pendingRows[request.id];
      return {
        id: request.id,
        view: request.view,
        interaction: {
          onAccept: () => run(request.id, 'accept', request.accept),
          onReject: () => run(request.id, 'reject', request.reject),
          acceptIsLoading: action === 'accept',
          rejectIsLoading: action === 'reject',
          acceptIsDisabled: !model.canAct || !!action,
          rejectIsDisabled: !model.canAct || !!action,
        },
      };
    }),
  };
};
