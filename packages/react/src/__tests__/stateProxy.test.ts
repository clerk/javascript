import type { SignInFutureResource, SignUpFutureResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { StateProxy } from '../stateProxy';

describe('StateProxy', () => {
  it('preserves a completed sign-in across chained calls when the client clears its sign-in attempt', async () => {
    const emptySignIn = {
      status: 'needs_identifier',
      createdSessionId: null as string | null,
      ticket: vi.fn(() => Promise.resolve({ error: null })),
      finalize: vi.fn(() => Promise.reject(new Error('Cannot finalize sign-in without a created session.'))),
    };
    const completedSignIn = {
      status: 'needs_identifier',
      createdSessionId: null as string | null,
      ticket: vi.fn(() => {
        client.signIn = { __internal_future: emptySignIn };
        completedSignIn.status = 'complete';
        completedSignIn.createdSessionId = 'sess_123';
        return Promise.resolve({ error: null });
      }),
      finalize: vi.fn(() => Promise.resolve({ error: null })),
    };
    const client = {
      signIn: { __internal_future: completedSignIn },
    };
    const state = {
      signInSignal: () => ({ signIn: completedSignIn }),
    };
    const loadedCallbacks: Array<() => void> = [];
    const isomorphicClerk = {
      loaded: false,
      client,
      __internal_state: state,
      addOnLoaded: vi.fn((callback: () => void) => loadedCallbacks.push(callback)),
    };
    const signIn = new StateProxy(isomorphicClerk as any).signInSignal().signIn as SignInFutureResource;

    const ticketPromise = signIn.ticket({ ticket: 'ticket_123' });
    expect(isomorphicClerk.addOnLoaded).toHaveBeenCalledOnce();
    expect(completedSignIn.ticket).not.toHaveBeenCalled();

    isomorphicClerk.loaded = true;
    loadedCallbacks.forEach(callback => callback());
    await ticketPromise;

    await expect(signIn.finalize()).resolves.toEqual({ error: null });
    expect(signIn.status).toBe('complete');
    expect(signIn.createdSessionId).toBe('sess_123');
    expect(completedSignIn.finalize).toHaveBeenCalledOnce();
    expect(emptySignIn.finalize).not.toHaveBeenCalled();
  });

  it('preserves a completed sign-up across chained calls when the client clears its sign-up attempt', async () => {
    const emptySignUp = {
      status: 'missing_requirements',
      createdSessionId: null as string | null,
      ticket: vi.fn(() => Promise.resolve({ error: null })),
      finalize: vi.fn(() =>
        Promise.resolve({ error: new Error('Cannot finalize sign-up without a created session.') }),
      ),
    };
    const completedSignUp = {
      status: 'missing_requirements',
      createdSessionId: null as string | null,
      ticket: vi.fn(() => {
        client.signUp = { __internal_future: emptySignUp };
        completedSignUp.status = 'complete';
        completedSignUp.createdSessionId = 'sess_123';
        return Promise.resolve({ error: null });
      }),
      finalize: vi.fn(() => Promise.resolve({ error: null })),
    };
    const client: {
      signUp: { __internal_future: typeof completedSignUp | typeof emptySignUp };
    } = {
      signUp: { __internal_future: completedSignUp },
    };
    const state = {
      signUpSignal: () => ({ signUp: completedSignUp }),
    };
    const loadedCallbacks: Array<() => void> = [];
    const isomorphicClerk = {
      loaded: false,
      client,
      __internal_state: state,
      addOnLoaded: vi.fn((callback: () => void) => loadedCallbacks.push(callback)),
    };
    const signUp = new StateProxy(isomorphicClerk as any).signUpSignal().signUp as SignUpFutureResource;

    const ticketPromise = signUp.ticket({ ticket: 'ticket_123' });
    expect(isomorphicClerk.addOnLoaded).toHaveBeenCalledOnce();
    expect(completedSignUp.ticket).not.toHaveBeenCalled();

    isomorphicClerk.loaded = true;
    loadedCallbacks.forEach(callback => callback());
    await ticketPromise;

    await expect(signUp.finalize()).resolves.toEqual({ error: null });
    expect(signUp.status).toBe('complete');
    expect(signUp.createdSessionId).toBe('sess_123');
    expect(completedSignUp.finalize).toHaveBeenCalledOnce();
    expect(emptySignUp.finalize).not.toHaveBeenCalled();
  });

  it('falls back to the client sign-in when the state signal is empty', async () => {
    const clientSignIn = {
      status: 'needs_first_factor',
      create: vi.fn(() => Promise.resolve({ error: null })),
    };
    const isomorphicClerk = {
      loaded: true,
      client: { signIn: { __internal_future: clientSignIn } },
      __internal_state: { signInSignal: () => ({ signIn: null }) },
    };
    const signIn = new StateProxy(isomorphicClerk as any).signInSignal().signIn as SignInFutureResource;

    await expect(signIn.create({ identifier: 'test@example.com' })).resolves.toEqual({ error: null });
    expect(signIn.status).toBe('needs_first_factor');
    expect(clientSignIn.create).toHaveBeenCalledOnce();
  });

  it('uses a newer sign-in from the state signal instead of the client attempt', async () => {
    const clientSignIn = {
      finalize: vi.fn(() => Promise.reject(new Error('Finalized the stale client sign-in.'))),
    };
    const currentSignIn = {
      finalize: vi.fn(() => Promise.resolve({ error: null })),
    };
    const isomorphicClerk = {
      loaded: true,
      client: { signIn: { __internal_future: clientSignIn } },
      __internal_state: { signInSignal: () => ({ signIn: currentSignIn }) },
    };
    const signIn = new StateProxy(isomorphicClerk as any).signInSignal().signIn as SignInFutureResource;

    await expect(signIn.finalize()).resolves.toEqual({ error: null });
    expect(currentSignIn.finalize).toHaveBeenCalledOnce();
    expect(clientSignIn.finalize).not.toHaveBeenCalled();
  });

  it('falls back to the fresh client sign-in after the retained state attempt is cleared', async () => {
    const clientSignIn = {
      status: 'needs_identifier',
    };
    let stateSignIn: { status: string; finalize: ReturnType<typeof vi.fn> } | null;
    const completedSignIn = {
      status: 'complete',
      finalize: vi.fn(() => {
        stateSignIn = null;
        return Promise.resolve({ error: null });
      }),
    };
    stateSignIn = completedSignIn;
    const isomorphicClerk = {
      loaded: true,
      client: { signIn: { __internal_future: clientSignIn } },
      __internal_state: { signInSignal: () => ({ signIn: stateSignIn }) },
    };
    const signIn = new StateProxy(isomorphicClerk as any).signInSignal().signIn as SignInFutureResource;

    expect(signIn.status).toBe('complete');
    await expect(signIn.finalize()).resolves.toEqual({ error: null });
    expect(signIn.status).toBe('needs_identifier');
  });
});
