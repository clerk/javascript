import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInternalNavFun } from '../useInternalNavFun';

let currentNavigate: NavigationFunction | undefined;

const windowNav = window.history.pushState.bind(window.history);

const Harness = ({ routerNav }: { routerNav: (...args: any[]) => unknown }) => {
  currentNavigate = useInternalNavFun({
    windowNav,
    routerNav: routerNav as any,
    name: 'push',
  });

  return null;
};

const navigate = (to: string) => {
  if (!currentNavigate) {
    throw new Error('navigate function is not initialized');
  }

  return currentNavigate(to, { windowNavigate: vi.fn() } as any) as Promise<void>;
};

describe('useInternalNavFun', () => {
  beforeEach(() => {
    currentNavigate = undefined;
    window.__clerk_internal_navigations = {};
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('dedupes duplicate in-flight pushes to the same destination', async () => {
    const routerNav = vi.fn();
    render(<Harness routerNav={routerNav} />);

    let firstPromise!: Promise<void>;
    let secondPromise!: Promise<void>;

    act(() => {
      firstPromise = navigate('/sign-in');
      secondPromise = navigate('/sign-in');
    });

    await waitFor(() => {
      expect(routerNav).toHaveBeenCalledTimes(1);
    });

    await expect(Promise.all([firstPromise, secondPromise])).resolves.toEqual([undefined, undefined]);
  });

  it('does not dedupe when destination differs', async () => {
    const routerNav = vi.fn();
    render(<Harness routerNav={routerNav} />);

    act(() => {
      void navigate('/sign-in');
      void navigate('/sign-up');
    });

    await waitFor(() => {
      expect(routerNav).toHaveBeenCalledTimes(2);
    });

    expect(routerNav).toHaveBeenNthCalledWith(1, '/sign-in');
    expect(routerNav).toHaveBeenNthCalledWith(2, '/sign-up');
  });

  it('allows a fresh same-destination push after flush', async () => {
    const routerNav = vi.fn();
    render(<Harness routerNav={routerNav} />);

    let firstPromise!: Promise<void>;
    let secondPromise!: Promise<void>;

    act(() => {
      firstPromise = navigate('/sign-in');
      secondPromise = navigate('/sign-in');
    });

    await waitFor(() => {
      expect(routerNav).toHaveBeenCalledTimes(1);
    });

    await expect(Promise.all([firstPromise, secondPromise])).resolves.toEqual([undefined, undefined]);

    act(() => {
      void navigate('/sign-in');
    });

    await waitFor(() => {
      expect(routerNav).toHaveBeenCalledTimes(2);
    });
  });

  it('resolves a single navigation promise without usePathname', async () => {
    const routerNav = vi.fn();
    render(<Harness routerNav={routerNav} />);

    let promise!: Promise<void>;
    act(() => {
      promise = navigate('/dashboard');
    });

    await waitFor(() => {
      expect(routerNav).toHaveBeenCalledWith('/dashboard');
    });

    // Promise resolves via isPending cycling alone — no usePathname needed
    await expect(promise).resolves.toBeUndefined();
  });

  it('flushes pre-existing window buffer on mount', async () => {
    const routerNav = vi.fn();

    // Simulate promises left in the window buffer from a previous component instance
    // (e.g., ClerkProvider unmounted during navigation — the core scenario from #2899)
    let resolved1 = false;
    let resolved2 = false;
    window.__clerk_internal_navigations = {
      push: {
        promisesBuffer: [
          () => {
            resolved1 = true;
          },
          () => {
            resolved2 = true;
          },
        ],
      },
    } as unknown as typeof window.__clerk_internal_navigations;

    render(<Harness routerNav={routerNav} />);

    // The mount effect should flush the pre-existing buffer
    await waitFor(() => {
      expect(resolved1).toBe(true);
      expect(resolved2).toBe(true);
    });
  });

  it('flushes pending promises on unmount', async () => {
    const routerNav = vi.fn();
    const { unmount } = render(<Harness routerNav={routerNav} />);

    // Manually add resolvers to the buffer to simulate pending navigations
    let resolved = false;
    const nav = window.__clerk_internal_navigations.push;
    nav.promisesBuffer = [
      () => {
        resolved = true;
      },
    ];

    unmount();

    // The useEffect cleanup should have flushed the promise buffer
    expect(resolved).toBe(true);
  });

  it('uses history pushState for internal navigations', async () => {
    const routerNav = vi.fn();
    const mockWindowNav = vi.fn();

    let internalNavigate: NavigationFunction | undefined;
    const InternalHarness = () => {
      internalNavigate = useInternalNavFun({
        windowNav: mockWindowNav as typeof window.history.pushState,
        routerNav: routerNav as any,
        name: 'push',
      });
      return null;
    };

    render(<InternalHarness />);

    act(() => {
      internalNavigate!('/shallow-path', {
        __internal_metadata: { navigationType: 'internal' },
        windowNavigate: vi.fn(),
      });
    });

    await waitFor(() => {
      expect(mockWindowNav).toHaveBeenCalledWith(null, '', '/shallow-path');
    });

    expect(routerNav).not.toHaveBeenCalled();
  });
});
