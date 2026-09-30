import { ClerkAPIResponseError, isReverificationCancelledError } from '@clerk/shared/error';
import type * as SharedReact from '@clerk/shared/react';
import { render, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createActor } from '../../../machine/createActor';
import { createMachine } from '../../../machine/createMachine';
import type { AnyActor } from '../../../machine/types';
import type { ReverificationActors } from '../reverification.machine';
import { ReverifiedAction, useReverifiedAction } from '../reverified-action';

let session: { id: string } | null | undefined;
let reverificationActors: ReverificationActors;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return { ...actual, useSession: () => ({ session }) };
});

vi.mock('../reverification.actors', () => ({
  useReverificationActors: () => reverificationActors,
}));

vi.mock('../../../hooks/useMosaicSupportEmail', () => ({
  useMosaicSupportEmail: () => undefined,
}));

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const needsReverification = () =>
  new ClerkAPIResponseError('reverify', {
    data: [{ code: 'session_reverification_required', message: 'Reverify', long_message: 'Reverify' }],
    status: 403,
  });

const complete = { status: 'complete', methods: [], startingMethod: null } as const;

beforeEach(() => {
  session = { id: 'sess_1' };
  reverificationActors = {
    startVerification: () => new Promise(() => {}),
    prepareFactor: () => Promise.resolve(),
    attemptFactor: () => Promise.resolve(complete),
    finishVerification: () => Promise.resolve(),
  };
});

function startChallenge() {
  const { result } = renderHook(() => useReverifiedAction(() => Promise.reject(needsReverification())));
  const actor = createActor(result.current).start();
  return actor;
}

describe('useReverifiedAction', () => {
  it('returns the same machine across renders', () => {
    const { result, rerender } = renderHook(() => useReverifiedAction(() => Promise.resolve()));
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });

  it('retries with the latest action after reverifying', async () => {
    const first = vi.fn(() => Promise.reject(needsReverification()));
    const latest = vi.fn(() => Promise.resolve());
    reverificationActors.startVerification = () => Promise.resolve(complete);
    const { result, rerender } = renderHook(({ action }) => useReverifiedAction(action), {
      initialProps: { action: first },
    });
    const actor = createActor(result.current).start();

    rerender({ action: latest });
    await tick();
    await tick();

    expect(first).toHaveBeenCalledOnce();
    expect(latest).toHaveBeenCalledOnce();
    expect(actor.getSnapshot().status).toBe('done');
  });
});

describe('ReverifiedAction', () => {
  it('renders nothing for an actor that is not a reverified action', () => {
    const other = createActor(createMachine({ initial: 'a', states: { a: {} } })).start();

    const { container } = render(<ReverifiedAction actor={other} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing without an actor', () => {
    const { container } = render(<ReverifiedAction actor={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  describe('session changes during the challenge', () => {
    async function mounted() {
      const actor = startChallenge();
      await tick();
      expect(actor.getSnapshot().value).toBe('verifying.challenge');
      const view = render(<ReverifiedAction actor={actor} />);
      return { actor, rerender: () => view.rerender(<ReverifiedAction actor={actor} />) };
    }

    const cancelled = (actor: AnyActor) => isReverificationCancelledError(actor.getSnapshot().error);

    it('cancels when the user switches sessions', async () => {
      const { actor, rerender } = await mounted();

      session = { id: 'sess_2' };
      rerender();

      expect(cancelled(actor)).toBe(true);
    });

    it('cancels when the user signs out', async () => {
      const { actor, rerender } = await mounted();

      session = null;
      rerender();

      expect(cancelled(actor)).toBe(true);
    });

    it('ignores the session briefly unloading', async () => {
      const { actor, rerender } = await mounted();

      session = undefined;
      rerender();
      session = { id: 'sess_1' };
      rerender();

      expect(actor.getSnapshot().value).toBe('verifying.challenge');
    });
  });
});
