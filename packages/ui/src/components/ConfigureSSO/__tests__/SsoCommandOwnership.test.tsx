import { __internal_useOrganizationEnterpriseConnections } from '@clerk/shared/react';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';

import { useOrganizationEnterpriseConnection } from '../hooks/useOrganizationEnterpriseConnection';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const connection = (id: string) =>
  ({
    id,
    name: id,
    provider: 'saml_custom',
    active: false,
    domains: ['existing.example.com'],
    oauthConfig: null,
    samlConnection: null,
  }) as unknown as EnterpriseConnectionResource;

async function setup(manage = false) {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
  });
  const organization = fixtures.clerk.organization!;
  organization.getEnterpriseConnections.mockResolvedValue([{ ...connection('original'), active: manage }]);
  organization.getDomains.mockResolvedValue({ data: [], total_count: 0 });
  organization.getEnterpriseConnectionTestRuns.mockResolvedValue({
    data: [{ id: 'successful_run', status: 'success' }],
    total_count: 1,
  } as never);
  let refreshConnections!: () => Promise<void>;
  const hook = renderHook(
    () => {
      refreshConnections = __internal_useOrganizationEnterpriseConnections().revalidate;
      return useOrganizationEnterpriseConnection({ manage });
    },
    { wrapper },
  );
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return { ...hook, fixtures, organization, refreshConnections: () => refreshConnections() };
}

describe('SSO command ownership', () => {
  it('discards an earlier connection success probe after the query changes the default', async () => {
    const { result, organization, refreshConnections } = await setup(true);
    const deferred = createDeferredPromise<Awaited<ReturnType<typeof organization.getEnterpriseConnectionTestRuns>>>();
    organization.getEnterpriseConnectionTestRuns.mockImplementation(id =>
      id === 'original' ? deferred.promise : Promise.resolve({ data: [], total_count: 0 }),
    );
    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.testRuns.revalidateHasSuccessfulTestRun();
    });
    organization.getEnterpriseConnections.mockResolvedValue([{ ...connection('second'), active: true }]);
    await act(async () => refreshConnections());
    await waitFor(() => expect(result.current.enterpriseConnection?.id).toBe('second'));
    await act(async () => {
      deferred.resolve({ data: [{ id: 'late_success', status: 'success' }], total_count: 1 } as never);
      expect(await pending).toBe(false);
    });
  });

  it('suppresses a late scoped write rejection after a query changes the connection', async () => {
    const { result, organization, refreshConnections } = await setup();
    const deferred = createDeferredPromise<EnterpriseConnectionResource>();
    organization.updateEnterpriseConnection.mockReturnValue(deferred.promise);
    const pending = result.current.setConnectionDomains(['pending.example.com']);
    organization.getEnterpriseConnections.mockResolvedValue([connection('second')]);
    await act(async () => refreshConnections());
    await waitFor(() => expect(result.current.enterpriseConnection?.id).toBe('second'));
    deferred.reject(new Error('Earlier connection failed'));
    await expect(pending).resolves.toBeUndefined();
  });

  it('blocks retained scoped writes after the query changes the default connection', async () => {
    const { result, organization, refreshConnections } = await setup();
    const retained = result.current;
    organization.getEnterpriseConnections.mockResolvedValue([connection('second')]);
    await act(async () => refreshConnections());
    await waitFor(() => expect(result.current.connectionScope).toEqual({ kind: 'existing', id: 'second' }));
    await retained.setConnectionDomains(['stale.example.com']);
    expect(organization.updateEnterpriseConnection).not.toHaveBeenCalled();
    await result.current.setConnectionDomains(['current.example.com']);
    expect(organization.updateEnterpriseConnection).toHaveBeenCalledWith('second', {
      domains: ['current.example.com'],
    });
  });

  it('does not revive a scoped callback when the default connection changes back', async () => {
    const { result, organization, refreshConnections } = await setup();
    const retained = result.current;
    organization.getEnterpriseConnections.mockResolvedValue([connection('second')]);
    await act(async () => refreshConnections());
    await waitFor(() => expect(result.current.enterpriseConnection?.id).toBe('second'));
    organization.getEnterpriseConnections.mockResolvedValue([connection('original')]);
    await act(async () => refreshConnections());
    await waitFor(() => expect(result.current.enterpriseConnection?.id).toBe('original'));
    await retained.setConnectionDomains(['stale.example.com']);
    expect(organization.updateEnterpriseConnection).not.toHaveBeenCalled();
  });

  it('blocks a retained scoped write when the explicitly selected connection disappears', async () => {
    const { result, organization, refreshConnections } = await setup();
    act(() => result.current.selectConnection({ kind: 'existing', id: 'original' }));
    const retained = result.current;
    organization.getEnterpriseConnections.mockResolvedValue([]);
    await act(async () => refreshConnections());
    await waitFor(() => expect(result.current.enterpriseConnection).toBeUndefined());
    await retained.setConnectionDomains(['stale.example.com']);
    expect(organization.updateEnterpriseConnection).not.toHaveBeenCalled();
  });

  it('keeps scoped commands valid when the same connection data changes', async () => {
    const { result, organization, refreshConnections } = await setup();
    const retained = result.current;
    organization.getEnterpriseConnections.mockResolvedValue([{ ...connection('original'), name: 'Updated name' }]);
    await act(async () => refreshConnections());
    await waitFor(() => expect(result.current.enterpriseConnection?.name).toBe('Updated name'));
    await retained.setConnectionDomains(['current.example.com']);
    expect(organization.updateEnterpriseConnection).toHaveBeenCalledWith('original', {
      domains: ['current.example.com'],
    });
  });

  it('resets the test page and excludes old rows while a different connection loads', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });
    const organization = fixtures.clerk.organization!;
    const configured = (id: string) => ({ ...connection(id), active: true });
    organization.getEnterpriseConnections.mockResolvedValue([configured('original'), configured('second')]);
    organization.getDomains.mockResolvedValue({ data: [], total_count: 0 });
    const deferred = createDeferredPromise<Awaited<ReturnType<typeof organization.getEnterpriseConnectionTestRuns>>>();
    organization.getEnterpriseConnectionTestRuns.mockImplementation(id =>
      id === 'original'
        ? Promise.resolve({ data: [{ id: 'old_run', status: 'success' }], total_count: 1 } as never)
        : deferred.promise,
    );
    const { result, rerender } = renderHook(() => useOrganizationEnterpriseConnection(), { wrapper });
    await waitFor(() => expect(result.current.testRuns.rows[0]?.id).toBe('old_run'));
    act(() => {
      result.current.testRuns.setPage(2);
    });
    await waitFor(() => expect(result.current.testRuns.page).toBe(2));
    act(() => {
      result.current.selectConnection({ kind: 'existing', id: 'second' });
    });
    expect(result.current.testRuns.page).toBe(1);
    expect(result.current.testRuns.rows).toEqual([]);
    rerender();
    expect(result.current.testRuns.rows).toEqual([]);
    await act(async () => {
      deferred.resolve({ data: [{ id: 'new_run', status: 'success' }], total_count: 1 } as never);
      await deferred.promise;
    });
    await waitFor(() => expect(result.current.testRuns.rows[0]?.id).toBe('new_run'));
  });

  it('suppresses a late rejection after the account changes', async () => {
    const { result, fixtures, organization } = await setup();
    const deferred = createDeferredPromise<EnterpriseConnectionResource>();
    organization.updateEnterpriseConnection.mockReturnValue(deferred.promise);
    let pending: ReturnType<typeof result.current.enterpriseConnectionMutations.setConnectionActive>;
    act(() => {
      pending = result.current.enterpriseConnectionMutations.setConnectionActive('original', true);
    });
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'other' } as never);
    await act(async () => {
      deferred.reject(new Error('An earlier owner request failed'));
      await expect(pending!).resolves.toBeUndefined();
    });
  });

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks retained writes when the canonical %s changes without a render',
    async field => {
      const { result, fixtures, organization } = await setup();
      const retained = result.current;
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field]!, id: 'other' } as never);
      await act(async () => {
        retained.selectConnection({ kind: 'new' });
        await retained.setConnectionDomains(['stale.example.com']);
        await retained.enterpriseConnectionMutations.createConnection('saml_okta');
        await retained.enterpriseConnectionMutations.changeProvider('original', 'saml_google');
        await retained.enterpriseConnectionMutations.updateConnection('original', { name: 'Stale' });
        await retained.enterpriseConnectionMutations.setConnectionActive('original', true);
        await retained.enterpriseConnectionMutations.deleteConnection('original');
        await retained.enterpriseConnectionMutations.createTestRun('original');
        await retained.organizationDomainMutations.createDomain('stale.example.com');
      });
      expect(organization.createEnterpriseConnection).not.toHaveBeenCalled();
      expect(organization.updateEnterpriseConnection).not.toHaveBeenCalled();
      expect(organization.deleteEnterpriseConnection).not.toHaveBeenCalled();
      expect(organization.createEnterpriseConnectionTestRun).not.toHaveBeenCalled();
      expect(organization.createDomain).not.toHaveBeenCalled();
      expect(result.current.connectionScope).toEqual({ kind: 'existing', id: 'original' });
    },
  );

  it('blocks commands retained after the source closes', async () => {
    const { result, unmount, organization } = await setup();
    const retained = result.current;
    unmount();
    await retained.enterpriseConnectionMutations.setConnectionActive('original', true);
    await retained.enterpriseConnectionMutations.createConnection('saml_okta');
    await retained.enterpriseConnectionMutations.createTestRun('original');
    expect(organization.updateEnterpriseConnection).not.toHaveBeenCalled();
    expect(organization.createEnterpriseConnection).not.toHaveBeenCalled();
    expect(organization.createEnterpriseConnectionTestRun).not.toHaveBeenCalled();
  });

  it('does not select a late created connection after the organization changes', async () => {
    const { result, fixtures, organization } = await setup();
    const deferred = createDeferredPromise<EnterpriseConnectionResource>();
    organization.createEnterpriseConnection.mockReturnValue(deferred.promise);
    let pending: ReturnType<typeof result.current.enterpriseConnectionMutations.createConnection>;
    act(() => {
      pending = result.current.enterpriseConnectionMutations.createConnection('saml_okta');
    });
    vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({ ...organization, id: 'other' } as never);
    await act(async () => {
      deferred.resolve(connection('created'));
      expect(await pending!).toBeUndefined();
    });
    expect(result.current.connectionScope).toEqual({ kind: 'existing', id: 'original' });
  });

  it('stops a provider replacement after deletion when the account changes', async () => {
    const { result, fixtures, organization } = await setup();
    const deferred = createDeferredPromise<Awaited<ReturnType<typeof organization.deleteEnterpriseConnection>>>();
    organization.deleteEnterpriseConnection.mockReturnValue(deferred.promise);
    let pending: ReturnType<typeof result.current.enterpriseConnectionMutations.changeProvider>;
    act(() => {
      pending = result.current.enterpriseConnectionMutations.changeProvider('original', 'saml_google');
    });
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'other' } as never);
    await act(async () => {
      deferred.resolve({ deleted: true } as never);
      await pending!;
    });
    expect(organization.deleteEnterpriseConnection).toHaveBeenCalledOnce();
    expect(organization.createEnterpriseConnection).not.toHaveBeenCalled();
  });

  it('keeps the selected connection when an earlier create completes', async () => {
    const { result, organization } = await setup();
    const deferred = createDeferredPromise<EnterpriseConnectionResource>();
    organization.createEnterpriseConnection.mockReturnValue(deferred.promise);
    act(() => {
      result.current.selectConnection({ kind: 'new' });
    });
    let pending: ReturnType<typeof result.current.enterpriseConnectionMutations.createConnection>;
    act(() => {
      pending = result.current.enterpriseConnectionMutations.createConnection('saml_okta');
    });
    act(() => {
      result.current.selectConnection({ kind: 'existing', id: 'original' });
    });
    await act(async () => {
      deferred.resolve(connection('created'));
      await pending!;
    });
    expect(result.current.connectionScope).toEqual({ kind: 'existing', id: 'original' });
  });

  it('resets draft selection and keeps earlier commands inactive after an account replacement', async () => {
    const { result, fixtures, rerender } = await setup();
    act(() => {
      result.current.selectConnection({ kind: 'new' });
    });
    await act(async () => {
      await result.current.setConnectionDomains(['draft.example.com']);
    });
    expect(result.current.connectionDomains).toEqual(['draft.example.com']);
    const retained = result.current;
    const originalUser = fixtures.clerk.user!;
    const nextUser = { ...originalUser, id: 'other' };
    const spy = vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(nextUser);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      user: nextUser,
    };
    rerender();
    expect(result.current.connectionScope).toEqual({ kind: 'existing', id: 'original' });
    expect(result.current.connectionDomains).toEqual(['existing.example.com']);
    spy.mockRestore();
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      user: originalUser,
    };
    rerender();
    expect(result.current.connectionScope).toEqual({ kind: 'existing', id: 'original' });
    expect(result.current.connectionDomains).toEqual(['existing.example.com']);
    expect(retained.canRun()).toBe(false);
  });

  it('discards a test URL after the client changes', async () => {
    const { result, fixtures, organization } = await setup();
    const deferred =
      createDeferredPromise<Awaited<ReturnType<typeof organization.createEnterpriseConnectionTestRun>>>();
    organization.createEnterpriseConnectionTestRun.mockReturnValue(deferred.promise);
    let pending: ReturnType<typeof result.current.enterpriseConnectionMutations.createTestRun>;
    act(() => {
      pending = result.current.enterpriseConnectionMutations.createTestRun('original');
    });
    vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'other' } as never);
    await act(async () => {
      deferred.resolve({ url: 'https://idp.example.com/test' } as never);
      expect(await pending!).toBeUndefined();
    });
  });
});
