import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useClearQueriesOnSignOut, withInfiniteKey } from '../useClearQueriesOnSignOut';
import { createMockQueryClient } from './mocks/clerk';

const mockQueryClient = createMockQueryClient();

vi.mock('../../clerk-rq/use-clerk-query-client', () => ({
  useClerkQueryClient: () => [mockQueryClient.client],
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockQueryClient.client.clear();
});

describe('useClearQueriesOnSignOut', () => {
  describe('withInfiniteKey helper', () => {
    it('returns array with regular and infinite key variants', () => {
      const result = withInfiniteKey('test-key');
      expect(result).toEqual(['test-key', 'test-key-inf']);
    });
  });

  describe('hook order stability', () => {
    it('should not throw when authenticated value changes', () => {
      // This test verifies the fix for the conditional useEffect issue.
      // Previously, changing `authenticated` would cause hook order errors.
      const { rerender } = renderHook(
        ({ authenticated, isSignedOut }: { authenticated: boolean; isSignedOut: boolean }) =>
          useClearQueriesOnSignOut({
            isSignedOut,
            stableKeys: 'test-key',
            authenticated,
          }),
        { initialProps: { authenticated: false, isSignedOut: false } },
      );

      // Should not throw when authenticated changes
      expect(() => {
        rerender({ authenticated: true, isSignedOut: false });
      }).not.toThrow();

      expect(() => {
        rerender({ authenticated: false, isSignedOut: true });
      }).not.toThrow();
    });
  });

  describe('sign-out query clearing', () => {
    it('should clear queries when transitioning from signed-in to signed-out', () => {
      // Setup: Add a query to the cache
      mockQueryClient.client.setQueryData(['test-key', true, {}, {}], { data: 'cached' });

      const { rerender } = renderHook(
        ({ isSignedOut }: { isSignedOut: boolean }) =>
          useClearQueriesOnSignOut({
            isSignedOut,
            stableKeys: 'test-key',
            authenticated: true,
          }),
        { initialProps: { isSignedOut: false } },
      );

      // Verify query exists
      expect(mockQueryClient.client.getQueryData(['test-key', true, {}, {}])).toBeDefined();

      // Transition to signed-out
      act(() => {
        rerender({ isSignedOut: true });
      });

      // Query should be cleared
      expect(mockQueryClient.client.getQueryData(['test-key', true, {}, {}])).toBeUndefined();
    });

    it('should NOT clear queries during initial load (first render)', () => {
      // Setup: Add a query to the cache before mounting
      mockQueryClient.client.setQueryData(['test-key', true, {}, {}], { data: 'cached' });

      // Mount with isSignedOut=true (simulating initial load with undefined user)
      renderHook(() =>
        useClearQueriesOnSignOut({
          isSignedOut: true,
          stableKeys: 'test-key',
          authenticated: true,
        }),
      );

      // Query should NOT be cleared on first render
      // because previousIsSignedIn is null on first render
      expect(mockQueryClient.client.getQueryData(['test-key', true, {}, {}])).toBeDefined();
    });

    it('should NOT clear queries when isSignedOut stays false', () => {
      mockQueryClient.client.setQueryData(['test-key', true, {}, {}], { data: 'cached' });

      const { rerender } = renderHook(
        ({ isSignedOut }: { isSignedOut: boolean }) =>
          useClearQueriesOnSignOut({
            isSignedOut,
            stableKeys: 'test-key',
            authenticated: true,
          }),
        { initialProps: { isSignedOut: false } },
      );

      // Re-render with same value
      act(() => {
        rerender({ isSignedOut: false });
      });

      // Query should still exist
      expect(mockQueryClient.client.getQueryData(['test-key', true, {}, {}])).toBeDefined();
    });
  });

  describe('authenticated parameter behavior', () => {
    it('should skip cleanup when authenticated is false', () => {
      mockQueryClient.client.setQueryData(['test-key', true, {}, {}], { data: 'cached' });

      const { rerender } = renderHook(
        ({ isSignedOut }: { isSignedOut: boolean }) =>
          useClearQueriesOnSignOut({
            isSignedOut,
            stableKeys: 'test-key',
            authenticated: false,
          }),
        { initialProps: { isSignedOut: false } },
      );

      // Transition to signed-out
      act(() => {
        rerender({ isSignedOut: true });
      });

      // Query should NOT be cleared because authenticated is false
      expect(mockQueryClient.client.getQueryData(['test-key', true, {}, {}])).toBeDefined();
    });

    it('should only clear queries with matching stableKey', () => {
      // Setup: Add multiple queries
      mockQueryClient.client.setQueryData(['key-a', true, {}, {}], { data: 'a' });
      mockQueryClient.client.setQueryData(['key-b', true, {}, {}], { data: 'b' });
      mockQueryClient.client.setQueryData(['key-c', true, {}, {}], { data: 'c' });

      const { rerender } = renderHook(
        ({ isSignedOut }: { isSignedOut: boolean }) =>
          useClearQueriesOnSignOut({
            isSignedOut,
            stableKeys: 'key-a',
            authenticated: true,
          }),
        { initialProps: { isSignedOut: false } },
      );

      act(() => {
        rerender({ isSignedOut: true });
      });

      // Only key-a should be cleared
      expect(mockQueryClient.client.getQueryData(['key-a', true, {}, {}])).toBeUndefined();
      expect(mockQueryClient.client.getQueryData(['key-b', true, {}, {}])).toBeDefined();
      expect(mockQueryClient.client.getQueryData(['key-c', true, {}, {}])).toBeDefined();
    });

    it('should clear multiple queries when stableKeys is an array', () => {
      mockQueryClient.client.setQueryData(['key-a', true, {}, {}], { data: 'a' });
      mockQueryClient.client.setQueryData(['key-b', true, {}, {}], { data: 'b' });
      mockQueryClient.client.setQueryData(['key-c', true, {}, {}], { data: 'c' });

      const { rerender } = renderHook(
        ({ isSignedOut }: { isSignedOut: boolean }) =>
          useClearQueriesOnSignOut({
            isSignedOut,
            stableKeys: ['key-a', 'key-b'],
            authenticated: true,
          }),
        { initialProps: { isSignedOut: false } },
      );

      act(() => {
        rerender({ isSignedOut: true });
      });

      // key-a and key-b should be cleared
      expect(mockQueryClient.client.getQueryData(['key-a', true, {}, {}])).toBeUndefined();
      expect(mockQueryClient.client.getQueryData(['key-b', true, {}, {}])).toBeUndefined();
      // key-c should remain
      expect(mockQueryClient.client.getQueryData(['key-c', true, {}, {}])).toBeDefined();
    });

    it('should only clear queries marked as authenticated in cache key', () => {
      // Setup: Add both authenticated and unauthenticated queries
      mockQueryClient.client.setQueryData(['test-key', true, {}, {}], { data: 'authenticated' });
      mockQueryClient.client.setQueryData(['test-key', false, {}, {}], { data: 'unauthenticated' });

      const { rerender } = renderHook(
        ({ isSignedOut }: { isSignedOut: boolean }) =>
          useClearQueriesOnSignOut({
            isSignedOut,
            stableKeys: 'test-key',
            authenticated: true,
          }),
        { initialProps: { isSignedOut: false } },
      );

      act(() => {
        rerender({ isSignedOut: true });
      });

      // Only authenticated query should be cleared
      expect(mockQueryClient.client.getQueryData(['test-key', true, {}, {}])).toBeUndefined();
      expect(mockQueryClient.client.getQueryData(['test-key', false, {}, {}])).toBeDefined();
    });
  });

  describe('onCleanup callback', () => {
    it('should call onCleanup after clearing queries', () => {
      const onCleanup = vi.fn();
      mockQueryClient.client.setQueryData(['test-key', true, {}, {}], { data: 'cached' });

      const { rerender } = renderHook(
        ({ isSignedOut }: { isSignedOut: boolean }) =>
          useClearQueriesOnSignOut({
            isSignedOut,
            stableKeys: 'test-key',
            authenticated: true,
            onCleanup,
          }),
        { initialProps: { isSignedOut: false } },
      );

      expect(onCleanup).not.toHaveBeenCalled();

      act(() => {
        rerender({ isSignedOut: true });
      });

      expect(onCleanup).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onCleanup when authenticated is false', () => {
      const onCleanup = vi.fn();

      const { rerender } = renderHook(
        ({ isSignedOut }: { isSignedOut: boolean }) =>
          useClearQueriesOnSignOut({
            isSignedOut,
            stableKeys: 'test-key',
            authenticated: false,
            onCleanup,
          }),
        { initialProps: { isSignedOut: false } },
      );

      act(() => {
        rerender({ isSignedOut: true });
      });

      expect(onCleanup).not.toHaveBeenCalled();
    });

    it('should NOT call onCleanup on initial render even if isSignedOut is true', () => {
      const onCleanup = vi.fn();

      renderHook(() =>
        useClearQueriesOnSignOut({
          isSignedOut: true,
          stableKeys: 'test-key',
          authenticated: true,
          onCleanup,
        }),
      );

      expect(onCleanup).not.toHaveBeenCalled();
    });
  });

  describe('state transitions', () => {
    it('should handle rapid sign-in/sign-out transitions correctly', () => {
      const onCleanup = vi.fn();
      mockQueryClient.client.setQueryData(['test-key', true, {}, {}], { data: 'cached' });

      const { rerender } = renderHook(
        ({ isSignedOut }: { isSignedOut: boolean }) =>
          useClearQueriesOnSignOut({
            isSignedOut,
            stableKeys: 'test-key',
            authenticated: true,
            onCleanup,
          }),
        { initialProps: { isSignedOut: false } },
      );

      // Sign out
      act(() => {
        rerender({ isSignedOut: true });
      });
      expect(onCleanup).toHaveBeenCalledTimes(1);

      // Re-add data and sign in
      mockQueryClient.client.setQueryData(['test-key', true, {}, {}], { data: 'new-cached' });
      act(() => {
        rerender({ isSignedOut: false });
      });
      expect(onCleanup).toHaveBeenCalledTimes(1); // Still 1, no additional call

      // Sign out again
      act(() => {
        rerender({ isSignedOut: true });
      });
      expect(onCleanup).toHaveBeenCalledTimes(2);
    });
  });
});
