import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import type { UserButtonReadyModel } from '../user-button.controller';
import { userButtonMachine } from '../user-button.controller';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const ready: UserButtonReadyModel = {
  status: 'ready',
  organizationsEnabled: true,
  activeSession: { sessionId: 'sess_1', name: 'Alice', identifier: 'alice@example.com' },
  activeOrganization: null,
  hasOrganizations: false,
  memberships: [],
  suggestions: [],
  invitations: [],
  additionalSessions: [],
};

const run = (
  overrides: Partial<{ key: string; run: () => Promise<unknown>; closeOnSuccess: boolean }> = {},
): {
  type: 'RUN';
  key: string;
  frozen: UserButtonReadyModel;
  run: () => Promise<unknown>;
  closeOnSuccess: boolean;
} => ({
  type: 'RUN',
  key: 'selectOrganization:org_1',
  frozen: ready,
  run: () => Promise.resolve(),
  closeOnSuccess: false,
  ...overrides,
});

const opened = () => {
  const actor = createActor(userButtonMachine);
  actor.start();
  actor.send({ type: 'OPEN' });
  return actor;
};

describe('userButtonMachine', () => {
  it('starts closed', () => {
    const actor = createActor(userButtonMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('closed');
  });

  it('opens and closes', () => {
    const actor = opened();
    expect(actor.getSnapshot().value).toBe('open');

    actor.send({ type: 'CLOSE' });
    expect(actor.getSnapshot().value).toBe('closed');
  });

  it('keys the affordance, freezes the controller, and runs the injected effect', () => {
    const effect = vi.fn(() => Promise.resolve());
    const actor = opened();

    actor.send(run({ run: effect }));

    expect(actor.getSnapshot().value).toBe('busy');
    expect(actor.getSnapshot().context.pendingKey).toBe('selectOrganization:org_1');
    expect(actor.getSnapshot().context.frozen).toBe(ready);
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('settles back into the open popup, releasing the freeze', async () => {
    const actor = opened();

    actor.send(run());
    await tick();

    expect(actor.getSnapshot().value).toBe('open');
    expect(actor.getSnapshot().context.pendingKey).toBeNull();
    expect(actor.getSnapshot().context.frozen).toBeNull();
  });

  it('closes on success for an action that ends the interaction', async () => {
    const actor = opened();

    actor.send(run({ closeOnSuccess: true }));
    await tick();

    expect(actor.getSnapshot().value).toBe('closed');
    expect(actor.getSnapshot().context.pendingKey).toBeNull();
  });

  it('holds the popup open when an action fails, even one that would have closed it', async () => {
    const actor = opened();

    actor.send(run({ closeOnSuccess: true, run: () => Promise.reject(new Error('cannot switch')) }));
    await tick();

    expect(actor.getSnapshot().value).toBe('open');
    expect(actor.getSnapshot().context.pendingKey).toBeNull();
    expect(actor.getSnapshot().context.frozen).toBeNull();
  });

  it('lets the row be clicked again after a failure', async () => {
    const actor = opened();

    actor.send(run({ run: () => Promise.reject(new Error('boom')) }));
    await tick();

    const retry = vi.fn(() => Promise.resolve());
    actor.send(run({ run: retry }));

    expect(actor.getSnapshot().value).toBe('busy');
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('refuses a second action while one is in flight', () => {
    const second = vi.fn(() => Promise.resolve());
    const actor = opened();

    actor.send(run({ key: 'signOutAll' }));
    actor.send(run({ key: 'switchSession:sess_2', run: second }));

    expect(actor.getSnapshot().context.pendingKey).toBe('signOutAll');
    expect(second).not.toHaveBeenCalled();
  });

  it('refuses an action while the popup is closed', () => {
    const effect = vi.fn(() => Promise.resolve());
    const actor = createActor(userButtonMachine);
    actor.start();

    actor.send(run({ run: effect }));

    expect(actor.getSnapshot().value).toBe('closed');
    expect(effect).not.toHaveBeenCalled();
  });

  it('abandons an action dismissed mid-flight rather than reopening on its result', async () => {
    const actor = opened();

    actor.send(run());
    actor.send({ type: 'CLOSE' });

    expect(actor.getSnapshot().value).toBe('closed');
    expect(actor.getSnapshot().context.pendingKey).toBeNull();

    await tick();

    expect(actor.getSnapshot().value).toBe('closed');
  });
});
