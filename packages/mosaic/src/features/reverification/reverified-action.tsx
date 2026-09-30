import { useSession } from '@clerk/shared/react';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { childActor } from '../../machine/createActor';
import { provide } from '../../machine/createMachine';
import type { Actor, AnyActor, StateMachine } from '../../machine/types';
import { useActor } from '../../machine/useMachine';
import { Reverification } from './reverification';
import { useReverificationActors } from './reverification.actors';
import { reverificationMachine } from './reverification.machine';
import {
  type ReverifiedActionContext,
  type ReverifiedActionEvent,
  reverifiedActionMachine,
} from './reverified-action.machine';

export function useReverifiedAction(
  action: () => Promise<unknown>,
): StateMachine<ReverifiedActionContext, ReverifiedActionEvent> {
  const actors = useReverificationActors();
  const latest = useRef({ action, actors });
  useLayoutEffect(() => {
    latest.current = { action, actors };
  });

  return useMemo(
    () =>
      provide(reverifiedActionMachine, {
        action: () => latest.current.action(),
        reverification: provide(reverificationMachine, {
          startVerification: level => latest.current.actors.startVerification(level),
          prepareFactor: method => latest.current.actors.prepareFactor(method),
          attemptFactor: input => latest.current.actors.attemptFactor(input),
          finishVerification: () => latest.current.actors.finishVerification(),
        }),
      }),
    [],
  );
}

function useSessionId(): string | null | undefined {
  const { session } = useSession();
  return session === undefined ? undefined : (session?.id ?? null);
}

function ReverifiedActionChallenge({ actor }: { actor: Actor<ReverifiedActionContext, ReverifiedActionEvent> }) {
  const [snapshot, send] = useActor(actor);
  const sessionId = useSessionId();
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

  return <Reverification actor={snapshot.children.reverification} />;
}

export function ReverifiedAction({ actor }: { actor: AnyActor | undefined }) {
  const running = childActor(actor, reverifiedActionMachine);
  if (!running) {
    return null;
  }
  return <ReverifiedActionChallenge actor={running} />;
}
