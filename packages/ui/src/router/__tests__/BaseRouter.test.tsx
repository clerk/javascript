import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route, useRouter, VirtualRouter } from '..';

const mockNavigate = vi.fn();

vi.mock('@clerk/shared/react', () => ({
  useClerk: () => ({
    navigate: vi.fn(to => {
      mockNavigate(to);
      if (to) {
        // @ts-ignore
        window.location = new URL(to, window.location.origin);
      }
      return Promise.resolve();
    }),
  }),
}));

describe('BaseRouter', () => {
  const oldWindowLocation = window.location;

  beforeAll(() => {
    // @ts-ignore
    delete window.location;
  });

  afterAll(() => {
    window.location = oldWindowLocation;
  });

  beforeEach(() => {
    mockNavigate.mockReset();
  });

  describe('concurrent navigations', () => {
    beforeEach(() => {
      // @ts-ignore
      window.location = new URL('https://www.example.com/virtual');
    });

    it('resolves all promises when multiple navigations occur before effect runs', async () => {
      let routerRef: ReturnType<typeof useRouter> | null = null;

      const CaptureRouter = () => {
        routerRef = useRouter();
        return null;
      };

      render(
        <VirtualRouter startPath='/'>
          <Route index>
            <CaptureRouter />
            <div>Index</div>
          </Route>
          <Route path='page1'>
            <div>Page 1</div>
          </Route>
          <Route path='page2'>
            <div>Page 2</div>
          </Route>
          <Route path='page3'>
            <div>Page 3</div>
          </Route>
        </VirtualRouter>,
      );

      expect(screen.queryByText('Index')).toBeInTheDocument();
      expect(routerRef).not.toBeNull();

      const results: string[] = [];
      let promise1: Promise<unknown>;
      let promise2: Promise<unknown>;
      let promise3: Promise<unknown>;

      // Trigger multiple navigations synchronously before React can run effects
      act(() => {
        promise1 = routerRef!.navigate('page1').then(() => {
          results.push('nav1');
        });
        promise2 = routerRef!.navigate('page2').then(() => {
          results.push('nav2');
        });
        promise3 = routerRef!.navigate('page3').then(() => {
          results.push('nav3');
        });
      });

      // All promises should resolve
      await Promise.all([promise1!, promise2!, promise3!]);

      // All three navigations should have resolved
      expect(results).toHaveLength(3);
      expect(results).toContain('nav1');
      expect(results).toContain('nav2');
      expect(results).toContain('nav3');
    });

    it('does not hang promises when rapid navigations occur', async () => {
      let routerRef: ReturnType<typeof useRouter> | null = null;

      const CaptureRouter = () => {
        routerRef = useRouter();
        return null;
      };

      render(
        <VirtualRouter startPath='/'>
          <Route index>
            <CaptureRouter />
          </Route>
          <Route path='target'>
            <div>Target</div>
          </Route>
        </VirtualRouter>,
      );

      expect(routerRef).not.toBeNull();

      // Create a race between navigation promise and a timeout
      // If navigation hangs, the timeout will win and the test will fail
      const navigationPromises: Promise<unknown>[] = [];

      act(() => {
        for (let i = 0; i < 5; i++) {
          navigationPromises.push(routerRef!.navigate('target'));
        }
      });

      // Use Promise.race to detect hanging promises
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Navigation promise timed out - likely hanging')), 1000);
      });

      // All navigations should resolve before the timeout
      await expect(Promise.race([Promise.all(navigationPromises), timeoutPromise])).resolves.toBeDefined();
    });

    it('resolves promises in order they were called', async () => {
      let routerRef: ReturnType<typeof useRouter> | null = null;
      const resolveOrder: number[] = [];

      const CaptureRouter = () => {
        routerRef = useRouter();
        return null;
      };

      render(
        <VirtualRouter startPath='/'>
          <Route index>
            <CaptureRouter />
          </Route>
          <Route path='a'>
            <div>A</div>
          </Route>
          <Route path='b'>
            <div>B</div>
          </Route>
        </VirtualRouter>,
      );

      let promise1: Promise<unknown>;
      let promise2: Promise<unknown>;

      act(() => {
        promise1 = routerRef!.navigate('a').then(() => {
          resolveOrder.push(1);
        });
        promise2 = routerRef!.navigate('b').then(() => {
          resolveOrder.push(2);
        });
      });

      await Promise.all([promise1!, promise2!]);

      // Promises should resolve in the order they were called
      expect(resolveOrder).toEqual([1, 2]);
    });
  });
});
