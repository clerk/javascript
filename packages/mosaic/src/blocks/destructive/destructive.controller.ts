import { useEffect, useRef } from 'react';

import type { AnyActor, ProvidedActors } from '../../machine/types';
import { useMachine } from '../../machine/useMachine';
import type { DestructiveControlledProps } from './destructive';
import { destructiveMachine } from './destructive.machine';

export type DestructiveController = Pick<
  DestructiveControlledProps,
  'open' | 'isDeleting' | 'errorMessage' | 'onOpenChange' | 'step'
> & {
  onDelete: () => void;
  openDestructiveDialog: () => void;
  verification: AnyActor | undefined;
};

export interface DestructiveReverification {
  actors: ProvidedActors;
  sessionId: string | null | undefined;
}

export function useDestructiveController({
  onDelete,
  reverification,
}: {
  onDelete: () => Promise<unknown>;
  reverification?: DestructiveReverification;
}): DestructiveController {
  const [snapshot, send] = useMachine(destructiveMachine, {
    context: { reverifiable: reverification !== undefined },
    actors: { ...reverification?.actors, action: onDelete },
  });

  const sessionId = reverification?.sessionId;
  const knownSessionId = useRef(sessionId);
  useEffect(() => {
    if (sessionId === undefined) {
      return;
    }
    const previous = knownSessionId.current;
    knownSessionId.current = sessionId;
    if (previous !== undefined && previous !== sessionId) {
      send({ type: 'SESSION_CHANGED' });
    }
  }, [sessionId, send]);

  return {
    open: snapshot.matches('open'),
    isDeleting: snapshot.matches('open.running') || snapshot.matches('open.verifying.retrying'),
    errorMessage: snapshot.matches('open.failed') ? snapshot.context.errorMessage : undefined,
    step: snapshot.matches('open.verifying') ? 'verify' : 'confirm',
    verification: snapshot.children.reverification,
    openDestructiveDialog: () => send({ type: 'OPEN' }),
    onDelete: () => send({ type: 'CONFIRM' }),
    onOpenChange: nextIsOpen => send(nextIsOpen ? { type: 'OPEN' } : { type: 'CLOSE' }),
  };
}
