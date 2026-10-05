import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../../__tests__/async';
import type { ReverificationController } from '../reverification.controller';
import { useReverificationController } from '../reverification.controller';
import type { ReverificationActiveModel, ReverificationModel } from '../reverification.model';
import type { ReverificationMethod, ReverificationResult } from '../reverification.types';

const password: ReverificationMethod = { id: 'password', stage: 'first', strategy: 'password' };

function activeModel(overrides: Partial<ReverificationActiveModel> = {}): ReverificationActiveModel {
  return {
    status: 'active',
    supportEmail: 'support@example.com',
    start: () => Promise.resolve({ status: 'needs_first_factor', methods: [password], startingMethod: password }),
    prepare: () => Promise.resolve(),
    attempt: () => Promise.resolve({ status: 'complete', methods: [password], startingMethod: password }),
    finish: () => Promise.resolve(),
    cancel: () => {},
    ...overrides,
  };
}

function ready(state: ReverificationController): Extract<ReverificationController, { status: 'ready' }> {
  if (state.status !== 'ready') {
    throw new Error('expected a ready reverification frame');
  }
  return state;
}

async function renderVerifying(model: ReverificationActiveModel) {
  const initialProps: { model: ReverificationModel } = { model };
  const hook = renderHook(({ model }) => useReverificationController(model, () => {}), { initialProps });
  await act(async () => {
    await tick();
  });
  return hook;
}

describe('useReverificationController', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('finishes with the last active callbacks after the model drops back to loading mid-submit', async () => {
    const attempt = deferred<ReverificationResult>();
    const finish = vi.fn(() => Promise.resolve());
    const model = activeModel({ attempt: () => attempt.promise, finish });
    const { result, rerender } = await renderVerifying(model);
    act(() => {
      ready(result.current).onValueChange('hunter2');
    });
    act(() => {
      ready(result.current).onSubmit();
    });

    rerender({ model: { status: 'loading', cancel: () => {} } });
    await act(async () => {
      attempt.resolve({ status: 'complete', methods: [password], startingMethod: password });
      await tick();
    });

    expect(finish).toHaveBeenCalledTimes(1);
  });

  it('keeps the support email for the held frame after the model settles', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    const { result, rerender } = await renderVerifying(activeModel());
    act(() => {
      ready(result.current).onShowHelp();
    });

    rerender({ model: { status: 'settled' } });
    await act(async () => {
      await tick();
    });
    ready(result.current).onEmailSupport();

    expect(assign).toHaveBeenCalledWith('mailto:support@example.com');
  });
});
