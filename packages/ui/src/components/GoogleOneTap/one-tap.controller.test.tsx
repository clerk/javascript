import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOneTapController } from './one-tap.controller';
import type { OneTapModel } from './one-tap.model';

function createModel() {
  let onCredential: ((credential: string) => void) | undefined;
  let onSkipped: (() => void) | undefined;
  const model: OneTapModel = {
    userId: undefined,
    isReady: true,
    setCredentialHandler: handler => {
      onCredential = handler;
    },
    prompt: vi.fn(handler => {
      onSkipped = handler;
    }),
    cancel: vi.fn(),
    authenticateCredential: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
  };

  return {
    model,
    credential: (value: string) => onCredential?.(value),
    skip: () => onSkipped?.(),
  };
}

describe('useOneTapController', () => {
  it('prompts once and handles a credential without cancelling it on unmount', async () => {
    const { model, credential } = createModel();
    const view = renderHook(() => useOneTapController(model));

    expect(model.prompt).toHaveBeenCalledTimes(1);
    view.rerender();
    expect(model.prompt).toHaveBeenCalledTimes(1);

    act(() => credential('google-token'));
    await waitFor(() => expect(model.authenticateCredential).toHaveBeenCalledWith('google-token'));
    view.unmount();
    expect(model.cancel).not.toHaveBeenCalled();
  });

  it('closes a skipped prompt and cancels one that remains open on unmount', () => {
    const { model, skip } = createModel();
    const view = renderHook(() => useOneTapController(model));

    act(skip);
    expect(model.close).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(model.cancel).toHaveBeenCalledTimes(1);
  });
});
