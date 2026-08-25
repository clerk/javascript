import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../../machine/createActor';
import {
  createReverificationDialogMachine,
  getReverificationDialogActions,
  getReverificationDialogState,
  getReverificationDialogViewProps,
} from '../reverification-dialog.machine';
import type {
  ReverificationDialogMachineDependencies,
  ReverificationDialogState,
} from '../reverification-dialog.types';

const idleResend = { isResending: false, secondsRemaining: 0 };

const passwordState: ReverificationDialogState = {
  strategy: 'password',
  value: '',
  status: 'idle',
  errors: {},
  resend: idleResend,
};

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

function createDependencies(
  overrides: Partial<ReverificationDialogMachineDependencies> = {},
): ReverificationDialogMachineDependencies {
  return {
    initialState: passwordState,
    prepare: vi.fn().mockResolvedValue(undefined),
    submit: vi.fn().mockResolvedValue({ status: 'complete' }),
    resend: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('reverification dialog machine', () => {
  it('drives the controlled view contract from machine events', () => {
    const actor = createActor(createReverificationDialogMachine(createDependencies()));
    actor.start();
    const actions = getReverificationDialogActions(actor.send);

    actions.onValueChange('secret');

    expect(getReverificationDialogState(actor.getSnapshot())).toMatchObject({
      step: 'verify',
      strategy: 'password',
      value: 'secret',
      status: 'idle',
    });
  });

  it('adapts a snapshot to flat, prop-driven view inputs', () => {
    const actor = createActor(createReverificationDialogMachine(createDependencies()));
    actor.start();

    const props = getReverificationDialogViewProps(actor.getSnapshot(), actor.send);

    expect(props).toMatchObject({
      open: true,
      strategy: 'password',
      value: '',
      isVerifying: false,
    });
    expect(props).not.toHaveProperty('state');
  });

  it('prepares delivered-code factors before showing verification', async () => {
    const prepare = vi.fn().mockResolvedValue(undefined);
    const actor = createActor(
      createReverificationDialogMachine(
        createDependencies({
          prepare,
          initialState: {
            ...passwordState,
            step: 'select-first-factor',
            availableFactors: [
              {
                id: 'email',
                strategy: 'email_code',
                label: 'Email code',
                identifier: 'i••••@clerk.dev',
              },
            ],
          },
        }),
      ),
    );
    actor.start();

    actor.send({ type: 'SELECT_FACTOR', factorId: 'email' });
    expect(getReverificationDialogState(actor.getSnapshot())).toMatchObject({
      step: 'prepare',
      preparationStatus: 'preparing',
      strategy: 'email_code',
    });

    await tick();

    expect(prepare).toHaveBeenCalledWith({
      strategy: 'email_code',
      stage: 'first',
      identifier: 'i••••@clerk.dev',
    });
    expect(getReverificationDialogState(actor.getSnapshot()).step).toBe('verify');
  });

  it('routes a successful first factor to second-factor selection', async () => {
    const actor = createActor(
      createReverificationDialogMachine(
        createDependencies({
          submit: vi.fn().mockResolvedValue({
            status: 'needs_second_factor',
            factors: [{ id: 'totp', strategy: 'totp', label: 'Authenticator app' }],
          }),
        }),
      ),
    );
    actor.start();
    actor.send({ type: 'CHANGE_VALUE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });

    await tick();

    expect(getReverificationDialogState(actor.getSnapshot())).toMatchObject({
      step: 'select-second-factor',
      stage: 'second',
      availableFactors: [{ id: 'totp', strategy: 'totp' }],
    });
  });

  it('maps submission errors back into the verification view', async () => {
    const actor = createActor(
      createReverificationDialogMachine(
        createDependencies({
          submit: vi.fn().mockRejectedValue(new Error('Incorrect password.')),
          mapError: () => ({ field: 'Incorrect password.' }),
        }),
      ),
    );
    actor.start();
    actor.send({ type: 'CHANGE_VALUE', value: 'wrong' });
    actor.send({ type: 'SUBMIT' });

    await tick();

    expect(getReverificationDialogState(actor.getSnapshot())).toMatchObject({
      step: 'verify',
      value: '',
      status: 'error',
      errors: { field: 'Incorrect password.' },
    });
  });

  it('reports cancellation and terminates the flow', () => {
    const onCancel = vi.fn();
    const actor = createActor(createReverificationDialogMachine(createDependencies({ onCancel })));
    actor.start();

    actor.send({ type: 'CANCEL' });

    expect(onCancel).toHaveBeenCalledOnce();
    expect(actor.getSnapshot()).toMatchObject({ value: 'cancelled', status: 'done' });
  });
});
