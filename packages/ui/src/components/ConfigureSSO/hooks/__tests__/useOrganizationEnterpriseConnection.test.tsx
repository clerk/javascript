import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The umbrella hook composes several `@clerk/shared/react` hooks. We mock the
// whole module so the test drives exactly what the source query and the
// underlying test-runs query report, and can assert how the umbrella gates the
// test-runs query's `enabled` and folds its loading into the global gate.

// Mutable state the connection-source mock reads from, so a test can flip from
// "no connection at load" to "connection created mid-flow" between renders.
const connectionsState = vi.hoisted(() => ({
  data: [] as Array<{ id: string }>,
  isLoading: false,
}));

// Captures the args each test-runs query was called with (notably `enabled`)
// plus the loading flags the mock should report. The internal hook is invoked
// twice per render (probe + list); we record every call.
const testRunsState = vi.hoisted(() => ({
  calls: [] as Array<{ enabled: boolean | undefined }>,
  isLoading: false,
  isFetching: false,
}));

vi.mock('@clerk/shared/react', () => ({
  __internal_useOrganizationEnterpriseConnections: () => ({
    data: connectionsState.data,
    isLoading: connectionsState.isLoading,
    createEnterpriseConnection: vi.fn(),
    updateEnterpriseConnection: vi.fn(),
    deleteEnterpriseConnection: vi.fn(),
  }),
  __internal_useOrganizationEnterpriseConnectionTestRuns: (params: { enabled?: boolean }) => {
    testRunsState.calls.push({ enabled: params.enabled });
    return {
      data: [],
      totalCount: 0,
      error: null,
      // Only report loading when the query is actually enabled — mirrors the
      // real disabled-query behaviour (`enabled: false` → not loading).
      isLoading: params.enabled !== false && testRunsState.isLoading,
      isFetching: params.enabled !== false && testRunsState.isFetching,
      isPolling: false,
      revalidate: vi.fn(() => Promise.resolve()),
    };
  },
  useReverification: (fn: unknown) => fn,
  useUser: () => ({ user: { primaryEmailAddress: { emailAddress: 'admin@clerk.com' }, emailAddresses: [] } }),
  useSession: () => ({ session: { id: 'sess_1' } }),
  useOrganization: () => ({ organization: { id: 'org_1' } }),
}));

import { useOrganizationEnterpriseConnection } from '../useOrganizationEnterpriseConnection';

beforeEach(() => {
  connectionsState.data = [];
  connectionsState.isLoading = false;
  testRunsState.calls = [];
  testRunsState.isLoading = false;
  testRunsState.isFetching = false;
});

const lastTwoCalls = () => testRunsState.calls.slice(-2);

describe('useOrganizationEnterpriseConnection — test-runs gating', () => {
  it('(a) existing connection at load → test-runs active and contribute to the global isLoading', () => {
    connectionsState.data = [{ id: 'ent_1' }];
    testRunsState.isLoading = true;

    const { result } = renderHook(() => useOrganizationEnterpriseConnection());

    // Both underlying queries (probe + list) are enabled from the first render.
    expect(lastTwoCalls()).toEqual([{ enabled: true }, { enabled: true }]);
    // A connection existed at load, so the cold test-runs load gates the full
    // skeleton.
    expect(result.current.isLoading).toBe(true);
    expect(result.current.testRuns.isLoading).toBe(true);
  });

  it('(b) no connection at load → test-runs inactive after a mid-flow create, and never gate the global skeleton', () => {
    connectionsState.data = [];
    testRunsState.isLoading = true;

    const { result, rerender } = renderHook(() => useOrganizationEnterpriseConnection());

    // No connection at load → both queries dormant.
    expect(lastTwoCalls()).toEqual([{ enabled: false }, { enabled: false }]);
    expect(result.current.isLoading).toBe(false);

    // A connection appears mid-flow (the create on the fresh-start path).
    connectionsState.data = [{ id: 'ent_new' }];
    rerender();

    // The query stays dormant — creating the connection must NOT fire it…
    expect(lastTwoCalls()).toEqual([{ enabled: false }, { enabled: false }]);
    // …and the global gate never folds in test-runs on this path, even though
    // the underlying flag would say loading were it enabled.
    expect(result.current.isLoading).toBe(false);
  });

  it('(c) after Test-step activation → test-runs active, with loading at the table level (isFetching), not the global skeleton', () => {
    connectionsState.data = [];

    const { result, rerender } = renderHook(() => useOrganizationEnterpriseConnection());

    // Connection created mid-flow; still dormant until the Test step activates.
    connectionsState.data = [{ id: 'ent_new' }];
    rerender();
    expect(lastTwoCalls()).toEqual([{ enabled: false }, { enabled: false }]);

    // The Test step calls `activate()` on entry. A background list fetch is now
    // in flight (table-level), but it is not a cold load.
    testRunsState.isFetching = true;
    act(() => {
      result.current.testRuns.activate();
    });

    // Now active → both queries fire.
    expect(lastTwoCalls()).toEqual([{ enabled: true }, { enabled: true }]);
    // Loading is table-level only…
    expect(result.current.testRuns.isFetching).toBe(true);
    // …and the global skeleton stays down: no connection at initial load, so
    // test-runs never gate it.
    expect(result.current.isLoading).toBe(false);
  });

  it('keeps the global skeleton up while the connection source itself is loading', () => {
    connectionsState.isLoading = true;

    const { result } = renderHook(() => useOrganizationEnterpriseConnection());

    expect(result.current.isLoading).toBe(true);
  });
});
