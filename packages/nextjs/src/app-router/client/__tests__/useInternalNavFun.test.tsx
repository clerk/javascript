import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInternalNavFun } from '../useInternalNavFun';

let mockedPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockedPathname,
}));

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
    mockedPathname = '/protected';
    currentNavigate = undefined;
    window.__clerk_internal_navigations = {};
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('dedupes duplicate in-flight pushes to the same destination', async () => {
    const routerNav = vi.fn();
    const view = render(<Harness routerNav={routerNav} />);

    let firstPromise!: Promise<void>;
    let secondPromise!: Promise<void>;

    act(() => {
      firstPromise = navigate('/sign-in');
      secondPromise = navigate('/sign-in');
    });

    await waitFor(() => {
      expect(routerNav).toHaveBeenCalledTimes(1);
    });

    // Simulate route change completion so buffered resolvers flush.
    mockedPathname = '/sign-in';
    view.rerender(<Harness routerNav={routerNav} />);

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
    const view = render(<Harness routerNav={routerNav} />);

    let firstPromise!: Promise<void>;
    let secondPromise!: Promise<void>;

    act(() => {
      firstPromise = navigate('/sign-in');
      secondPromise = navigate('/sign-in');
    });

    await waitFor(() => {
      expect(routerNav).toHaveBeenCalledTimes(1);
    });

    mockedPathname = '/sign-in';
    view.rerender(<Harness routerNav={routerNav} />);

    await expect(Promise.all([firstPromise, secondPromise])).resolves.toEqual([undefined, undefined]);

    act(() => {
      void navigate('/sign-in');
    });

    await waitFor(() => {
      expect(routerNav).toHaveBeenCalledTimes(2);
    });
  });
});
