import type { EmailAddressResource } from '@clerk/shared/types';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The umbrella hook composes several `@clerk/shared/react` hooks. We mock the
// whole module so the test drives exactly what the source query and the
// underlying test-runs query report, and can assert how the umbrella gates the
// test-runs query's `enabled` and folds its loading into the global gate.

// A connection shaped enough for the umbrella's gating: the derived
// "configured" predicate reads `samlConnection.idpSsoUrl` + `idpEntityId`, and
// the active path reads `active`.
type MockConnection = {
  id: string;
  active?: boolean;
  samlConnection?: { idpSsoUrl?: string; idpEntityId?: string } | null;
};

const configuredConnection = (id: string): MockConnection => ({
  id,
  samlConnection: { idpSsoUrl: 'https://idp.example.com/sso', idpEntityId: 'https://idp.example.com/entity' },
});

const unconfiguredConnection = (id: string): MockConnection => ({ id, samlConnection: null });

// Mutable state the connection-source mock reads from, so a test can flip from
// "no connection at load" to "connection created mid-flow" between renders.
const connectionsState = vi.hoisted(() => ({
  data: [] as MockConnection[],
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

// Stable spies for the source mutations so a test can assert what the umbrella
// hook forwards to the underlying create/update/delete handles.
const mutationSpies = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@clerk/shared/react', () => ({
  __internal_useOrganizationEnterpriseConnections: () => ({
    data: connectionsState.data,
    isLoading: connectionsState.isLoading,
    createEnterpriseConnection: mutationSpies.create,
    updateEnterpriseConnection: mutationSpies.update,
    deleteEnterpriseConnection: mutationSpies.delete,
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
  mutationSpies.create.mockReset();
  mutationSpies.update.mockReset();
  mutationSpies.delete.mockReset();
});

const lastTwoCalls = () => testRunsState.calls.slice(-2);

describe('useOrganizationEnterpriseConnection — test-runs gating', () => {
  it('(a) existing configured connection at load → test-runs active and contribute to the global isLoading', () => {
    connectionsState.data = [configuredConnection('ent_1')];
    testRunsState.isLoading = true;

    const { result } = renderHook(() => useOrganizationEnterpriseConnection());

    // A configured connection existed at load → both underlying queries (probe +
    // list) are enabled from the first render.
    expect(lastTwoCalls()).toEqual([{ enabled: true }, { enabled: true }]);
    // …so the cold test-runs load gates the full skeleton (hadInitialConnection).
    expect(result.current.isLoading).toBe(true);
    expect(result.current.testRuns.isLoading).toBe(true);
  });

  it('(a2) active (but unconfigured) connection at load → test-runs active via the isActive path', () => {
    connectionsState.data = [{ id: 'ent_active', active: true, samlConnection: null }];

    const { result } = renderHook(() => useOrganizationEnterpriseConnection());

    expect(lastTwoCalls()).toEqual([{ enabled: true }, { enabled: true }]);
    expect(result.current.isLoading).toBe(false);
  });

  it('(b) fresh start: no connection → dormant; connection created but NOT yet configured → still dormant, never gating the global skeleton', () => {
    connectionsState.data = [];
    testRunsState.isLoading = true;

    const { result, rerender } = renderHook(() => useOrganizationEnterpriseConnection());

    // No connection at load → both queries dormant.
    expect(lastTwoCalls()).toEqual([{ enabled: false }, { enabled: false }]);
    expect(result.current.isLoading).toBe(false);

    // A connection appears mid-flow but is not yet configured (the create on the
    // fresh-start path, before the configure step fills in the SAML fields).
    connectionsState.data = [unconfiguredConnection('ent_new')];
    rerender();

    // The query stays dormant — creating an unconfigured connection must NOT
    // fire it…
    expect(lastTwoCalls()).toEqual([{ enabled: false }, { enabled: false }]);
    // …and the global gate never folds in test-runs on this path, even though
    // the underlying flag would say loading were it enabled.
    expect(result.current.isLoading).toBe(false);
  });

  it('(c) fresh start: once the connection is configured → test-runs active, with loading at the table level (isFetching), not the global skeleton', () => {
    connectionsState.data = [];

    const { result, rerender } = renderHook(() => useOrganizationEnterpriseConnection());

    // Connection created mid-flow but unconfigured → still dormant.
    connectionsState.data = [unconfiguredConnection('ent_new')];
    rerender();
    expect(lastTwoCalls()).toEqual([{ enabled: false }, { enabled: false }]);

    // The configure step fills in the SAML fields. A background list fetch is now
    // in flight (table-level), but it is not a cold load.
    testRunsState.isFetching = true;
    connectionsState.data = [configuredConnection('ent_new')];
    rerender();

    // Now configured → both queries fire.
    expect(lastTwoCalls()).toEqual([{ enabled: true }, { enabled: true }]);
    // Loading is table-level only…
    expect(result.current.testRuns.isFetching).toBe(true);
    // …and the global skeleton stays down: no connection at initial load, so
    // test-runs never gate it (no flash on configure → test).
    expect(result.current.isLoading).toBe(false);
  });

  it('keeps the global skeleton up while the connection source itself is loading', () => {
    connectionsState.isLoading = true;

    const { result } = renderHook(() => useOrganizationEnterpriseConnection());

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useOrganizationEnterpriseConnection — mutations', () => {
  const emailAddress = (address: string) => ({ emailAddress: address }) as EmailAddressResource;

  it('createConnection derives name + domains from the email domain and forwards them (no organizationId in body)', async () => {
    const { result } = renderHook(() => useOrganizationEnterpriseConnection());

    await result.current.mutations.createConnection('saml_okta', emailAddress('admin@acme.com'));

    expect(mutationSpies.create).toHaveBeenCalledTimes(1);
    expect(mutationSpies.create).toHaveBeenCalledWith({
      provider: 'saml_okta',
      name: 'acme.com',
      domains: ['acme.com'],
    });
  });

  it('createConnection resolves to undefined without creating when no email is available', async () => {
    const { result } = renderHook(() => useOrganizationEnterpriseConnection());

    await expect(result.current.mutations.createConnection('saml_okta', undefined)).resolves.toBeUndefined();
    expect(mutationSpies.create).not.toHaveBeenCalled();
  });

  it('setConnectionActive forwards only the active flag to update', async () => {
    const { result } = renderHook(() => useOrganizationEnterpriseConnection());

    await result.current.mutations.setConnectionActive('ent_1', true);

    expect(mutationSpies.update).toHaveBeenCalledWith('ent_1', { active: true });
  });
});
