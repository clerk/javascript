import { act, cleanup, render, waitFor } from '@testing-library/react';
import React, { useTransition } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeferredRefresh } from '../useDeferredRefresh';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

let currentRefresh: (() => void) | undefined;
let startHeldTransition: (() => void) | undefined;
let finishHeldTransition: (() => void) | undefined;

// Suspends inside a transition until the gate promise resolves, keeping
// React's transition lanes pending (the state the deferral gate protects)
const gate: { promise: Promise<void> | null; done: boolean } = { promise: null, done: false };

const Suspender = () => {
  if (!gate.done) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw gate.promise;
  }
  return null;
};

const Harness = () => {
  currentRefresh = useDeferredRefresh();
  const [suspended, setSuspended] = React.useState(false);
  const [, startTransition] = useTransition();
  startHeldTransition = () => {
    gate.done = false;
    let resolveGate!: () => void;
    gate.promise = new Promise<void>(res => {
      resolveGate = res;
    });
    finishHeldTransition = () => {
      gate.done = true;
      resolveGate();
    };
    startTransition(() => setSuspended(true));
  };
  return <React.Suspense fallback={null}>{suspended ? <Suspender /> : null}</React.Suspense>;
};

const refresh = () => {
  if (!currentRefresh) {
    throw new Error('refresh function is not initialized');
  }
  currentRefresh();
};

describe('useDeferredRefresh', () => {
  beforeEach(() => {
    currentRefresh = undefined;
    window.__clerk_internal_refresh = undefined;
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('dispatches router.refresh once transitions settle', async () => {
    render(<Harness />);

    act(() => {
      refresh();
    });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('does not dispatch router.refresh while another transition is pending', async () => {
    render(<Harness />);

    act(() => {
      startHeldTransition!();
    });

    act(() => {
      refresh();
    });

    // Let effects and microtasks run; the refresh must stay parked while the
    // held transition keeps React's transition lanes pending
    await act(async () => {
      await new Promise(res => setTimeout(res, 20));
    });
    expect(mockRefresh).not.toHaveBeenCalled();
    expect(window.__clerk_internal_refresh?.pending).toBe(true);

    act(() => {
      finishHeldTransition!();
    });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
    expect(window.__clerk_internal_refresh?.pending).toBe(false);
  });

  it('coalesces concurrent requests into a single router.refresh', async () => {
    render(<Harness />);

    act(() => {
      refresh();
      refresh();
    });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call router.refresh when nothing was requested', async () => {
    render(<Harness />);

    // Give the isPending effect a chance to run on mount
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('dispatches a refresh left pending by a previous instance on mount', async () => {
    window.__clerk_internal_refresh = { pending: true };

    render(<Harness />);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
    expect(window.__clerk_internal_refresh?.pending).toBe(false);
  });

  it('preserves a refresh requested after unmount for the next instance', async () => {
    const { unmount } = render(<Harness />);
    unmount();

    // Request while no instance is mounted (e.g. ClerkProvider remounting during a navigation)
    refresh();
    expect(window.__clerk_internal_refresh?.pending).toBe(true);
    expect(mockRefresh).not.toHaveBeenCalled();

    render(<Harness />);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('allows a fresh refresh after a previous dispatch', async () => {
    render(<Harness />);

    act(() => {
      refresh();
    });
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    act(() => {
      refresh();
    });
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(2);
    });
  });
});
