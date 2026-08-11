import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAwaitableRefresh } from '../useAwaitableRefresh';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

let currentRefresh: (() => Promise<void>) | undefined;

const Harness = () => {
  currentRefresh = useAwaitableRefresh();
  return null;
};

const refresh = () => {
  if (!currentRefresh) {
    throw new Error('refresh function is not initialized');
  }
  return currentRefresh();
};

describe('useAwaitableRefresh', () => {
  beforeEach(() => {
    currentRefresh = undefined;
    window.__clerk_internal_refresh = undefined;
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('dispatches router.refresh once transitions settle and resolves the promise', async () => {
    render(<Harness />);

    let promise!: Promise<void>;
    act(() => {
      promise = refresh();
    });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    await expect(promise).resolves.toBeUndefined();
  });

  it('coalesces concurrent refresh calls into a single router.refresh', async () => {
    render(<Harness />);

    let firstPromise!: Promise<void>;
    let secondPromise!: Promise<void>;

    act(() => {
      firstPromise = refresh();
      secondPromise = refresh();
    });

    await expect(Promise.all([firstPromise, secondPromise])).resolves.toEqual([undefined, undefined]);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not call router.refresh when nothing was requested', async () => {
    render(<Harness />);

    // Give the isPending effect a chance to run on mount
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('refreshes and resolves a stale buffer left by a previous instance on mount', async () => {
    let resolved = false;
    window.__clerk_internal_refresh = {
      promisesBuffer: [
        () => {
          resolved = true;
        },
      ],
    };

    render(<Harness />);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(resolved).toBe(true);
    });
  });

  it('resolves pending promises on unmount', () => {
    const { unmount } = render(<Harness />);

    let resolved = false;
    window.__clerk_internal_refresh!.promisesBuffer = [
      () => {
        resolved = true;
      },
    ];

    unmount();

    expect(resolved).toBe(true);
  });

  it('allows a fresh refresh after a previous flush', async () => {
    render(<Harness />);

    let firstPromise!: Promise<void>;
    act(() => {
      firstPromise = refresh();
    });
    await expect(firstPromise).resolves.toBeUndefined();

    let secondPromise!: Promise<void>;
    act(() => {
      secondPromise = refresh();
    });
    await expect(secondPromise).resolves.toBeUndefined();

    expect(mockRefresh).toHaveBeenCalledTimes(2);
  });
});
