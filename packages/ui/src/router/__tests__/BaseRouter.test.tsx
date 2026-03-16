import type { Clerk } from '@clerk/shared/types';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { PathRouter, Route, Switch, useRouter } from '..';

const mockNavigate = vi.fn();

vi.mock('@clerk/shared/react', () => {
  return {
    useClerk: () => {
      return {
        navigate: (to: string) => {
          mockNavigate(to);
          if (to) {
            // @ts-ignore
            window.location = new URL(to, window.location.origin);
          }
          return Promise.resolve();
        },
      } as Clerk;
    },
  };
});

/**
 * Renders router.currentPath so tests can assert against it.
 */
const CurrentPath = () => {
  const router = useRouter();
  return <div data-testid='current-path'>{router.currentPath}</div>;
};

const oldWindowLocation = window.location;

const setWindowLocation = (url: string) => {
  // @ts-ignore
  window.location = new URL(url);
};

describe('BaseRouter basePath guard', () => {
  beforeAll(() => {
    // @ts-ignore
    delete window.location;
  });

  afterAll(() => {
    window.location = oldWindowLocation;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('does not update state for out-of-basePath navigations', () => {
    it('keeps currentPath when window.location changes outside basePath and refresh is called', () => {
      setWindowLocation('https://www.example.com/sign-in');

      const RefreshTrigger = () => {
        const router = useRouter();
        return (
          <button
            data-testid='refresh'
            onClick={() => router.refresh()}
          >
            Refresh
          </button>
        );
      };

      render(
        <PathRouter basePath='/sign-in'>
          <Route index>
            <CurrentPath />
            <RefreshTrigger />
          </Route>
        </PathRouter>,
      );

      // Verify initial state
      expect(screen.getByTestId('current-path').textContent).toBe('/sign-in');

      // Simulate URL changing outside basePath (e.g. framework navigation)
      setWindowLocation('https://www.example.com/');

      // Call refresh — this should bail out because '/' doesn't start with '/sign-in'
      act(() => {
        screen.getByTestId('refresh').click();
      });

      // currentPath should still be /sign-in, not /
      expect(screen.getByTestId('current-path').textContent).toBe('/sign-in');
    });

    it('does not trigger catch-all route when URL changes outside basePath', () => {
      setWindowLocation('https://www.example.com/sign-in');

      const redirectFn = vi.fn();

      const CatchAll = () => {
        React.useEffect(() => {
          redirectFn();
        }, []);
        return <div data-testid='catch-all'>Redirecting...</div>;
      };

      const RefreshTrigger = () => {
        const router = useRouter();
        return (
          <button
            data-testid='refresh'
            onClick={() => router.refresh()}
          >
            Refresh
          </button>
        );
      };

      render(
        <PathRouter basePath='/sign-in'>
          <Switch>
            <Route index>
              <CurrentPath />
              <RefreshTrigger />
            </Route>
            <Route>
              <CatchAll />
            </Route>
          </Switch>
        </PathRouter>,
      );

      // Verify initial render — index route should match
      expect(screen.getByTestId('current-path').textContent).toBe('/sign-in');
      expect(screen.queryByTestId('catch-all')).toBeNull();
      expect(redirectFn).not.toHaveBeenCalled();

      // Simulate URL changing outside basePath
      setWindowLocation('https://www.example.com/');

      // Call refresh — should be guarded by basePath check
      act(() => {
        screen.getByTestId('refresh').click();
      });

      // The catch-all should NOT have rendered
      expect(screen.queryByTestId('catch-all')).toBeNull();
      expect(redirectFn).not.toHaveBeenCalled();
      // Index route should still be visible
      expect(screen.getByTestId('current-path').textContent).toBe('/sign-in');
    });
  });

  describe('still updates state for within-basePath navigations', () => {
    it('updates currentPath when URL changes within basePath', () => {
      setWindowLocation('https://www.example.com/sign-in');

      const RefreshTrigger = () => {
        const router = useRouter();
        return (
          <button
            data-testid='refresh'
            onClick={() => router.refresh()}
          >
            Refresh
          </button>
        );
      };

      render(
        <PathRouter basePath='/sign-in'>
          <Route path='factor-one'>
            <div data-testid='factor-one'>Factor One</div>
          </Route>
          <Route index>
            <CurrentPath />
            <RefreshTrigger />
          </Route>
        </PathRouter>,
      );

      // Verify initial state
      expect(screen.getByTestId('current-path').textContent).toBe('/sign-in');

      // Simulate URL changing within basePath
      setWindowLocation('https://www.example.com/sign-in/factor-one');

      // Call refresh — this should update because '/sign-in/factor-one' starts with '/sign-in'
      act(() => {
        screen.getByTestId('refresh').click();
      });

      // currentPath should have updated
      expect(screen.getByTestId('factor-one')).toBeInTheDocument();
    });
  });
});
