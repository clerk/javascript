import { describe, expect, it } from 'vitest';

import { deferred, tick } from '../../__tests__/async';
import { createActor } from '../create-actor';
import { createMachine } from '../create-machine';
import { waitFor } from '../wait-for';

function startSending() {
  const gate = deferred<void>();
  const machine = createMachine<Record<string, never>, { type: 'SEND' }>({
    initial: 'idle',
    states: {
      idle: { on: { SEND: 'sending' } },
      sending: { invoke: { src: () => gate.promise, onDone: 'sent' } },
      sent: {},
    },
  });
  const actor = createActor(machine);
  actor.start();
  return { actor, gate };
}

describe('waitFor', () => {
  it('resolves with the current snapshot when it already matches', async () => {
    const { actor } = startSending();

    await expect(waitFor(actor, snapshot => snapshot.value === 'idle')).resolves.toMatchObject({ value: 'idle' });
  });

  it('resolves once the actor reaches a matching snapshot', async () => {
    const { actor, gate } = startSending();
    actor.send({ type: 'SEND' });
    let settled = false;
    const waiting = waitFor(actor, snapshot => snapshot.value !== 'sending').then(snapshot => {
      settled = true;
      return snapshot;
    });

    await tick();
    expect(settled).toBe(false);

    gate.resolve();
    await expect(waiting).resolves.toMatchObject({ value: 'sent' });
  });
});
