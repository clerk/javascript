import { isReverificationCancelledError } from '@clerk/shared/error';
import { useReverification, useSession } from '@clerk/shared/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ActionContext } from '../../hooks/useAction';
import type { Prompt } from '../../utils/prompt';
import { Reverification } from './reverification';
import { useReverificationController } from './reverification.controller';
import { useReverificationModel } from './reverification.model';
import type { ReverificationState } from './reverification.types';

type Challenge = {
  sessionId: string | null;
  cancel: () => void;
};

export type Reverify = <T>(ctx: ActionContext, fn: () => Promise<T>) => Promise<T>;

export type UseReverifyResult = {
  reverify: Reverify;
  prompt: Prompt | null;
};

export function useReverify(): UseReverifyResult {
  const { session } = useSession();
  const [state, setState] = useState<ReverificationState>({ phase: 'inactive' });
  const controller = useReverificationController(useReverificationModel(state));
  const inFlight = useRef(false);
  const challengeRef = useRef<Challenge | null>(null);

  const call = useReverification((run: () => Promise<unknown>) => run(), {
    onNeedsReverification: ({ level, complete, cancel }) => {
      if (!inFlight.current) {
        cancel();
        return;
      }

      const end = (done: () => void) => () => {
        if (challengeRef.current !== challenge) {
          return;
        }
        challengeRef.current = null;
        done();
      };
      const challenge: Challenge = {
        sessionId: session?.id ?? null,
        cancel: end(cancel),
      };
      challengeRef.current = challenge;
      setState({
        phase: 'active',
        level,
        complete: end(() => {
          setState({ phase: 'retrying' });
          complete();
        }),
        cancel: challenge.cancel,
      });
    },
  });

  useEffect(() => {
    const challenge = challengeRef.current;
    if (!challenge || session === undefined) {
      return;
    }
    if (session !== null && challenge.sessionId === null) {
      challenge.sessionId = session.id;
      return;
    }
    if (session === null || session.id !== challenge.sessionId) {
      challenge.cancel();
    }
  }, [session]);

  useEffect(() => () => challengeRef.current?.cancel(), []);

  const reverify = useCallback(
    async <T,>(ctx: ActionContext, fn: () => Promise<T>): Promise<T> => {
      if (inFlight.current) {
        throw new Error('A reverified request is already in progress.');
      }
      inFlight.current = true;
      ctx.onSettled(() => setState({ phase: 'inactive' }));
      const settled: { current?: { value: T } } = {};
      try {
        await call(async () => {
          const value = await fn();
          settled.current = { value };
          return value;
        });
      } catch (error) {
        if (isReverificationCancelledError(error)) {
          ctx.cancelled();
        }
        throw error;
      } finally {
        inFlight.current = false;
        challengeRef.current = null;
      }
      if (!settled.current) {
        throw new Error('The reverified request finished without a value.');
      }
      return settled.current.value;
    },
    [call],
  );

  const prompt =
    controller.status === 'idle' || controller.status === 'loading'
      ? null
      : { content: <Reverification {...controller} />, cancel: controller.onCancel };

  return { reverify, prompt };
}
