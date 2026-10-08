import {
  __internal_useOrganizationDirectorySync,
  __internal_useOrganizationEnterpriseConnections,
} from '@clerk/shared/react';
import type { DirectorySyncResource, EnterpriseConnectionResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';

import { useSecurityDirectorySyncModel } from '../security-directory-sync.model';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const connection = (id: string) =>
  ({ id, name: id, active: true, domains: [], provider: 'saml_okta' }) as EnterpriseConnectionResource;
const setup = async () => {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
  });
  const organization = fixtures.clerk.organization!;
  const update = vi.fn(() => Promise.resolve(directory));
  const remove = vi.fn(() => Promise.resolve({ deleted: true }));
  const directory = {
    id: 'directory_1',
    organizationId: organization.id,
    enterpriseConnectionId: 'connection_1',
    enabled: true,
    update,
    delete: remove,
  } as unknown as DirectorySyncResource;
  organization.getEnterpriseConnections.mockResolvedValue([connection('connection_1')]);
  organization.getDirectorySync.mockResolvedValue(directory);
  let refreshConnections!: () => Promise<void>;
  let refreshDirectory!: () => Promise<void>;
  const hook = renderHook(
    () => {
      refreshConnections = __internal_useOrganizationEnterpriseConnections().revalidate;
      refreshDirectory = __internal_useOrganizationDirectorySync({ enterpriseConnectionId: 'connection_1' }).revalidate;
      return useSecurityDirectorySyncModel();
    },
    { wrapper },
  );
  await waitFor(() => expect(hook.result.current.status).toBe('active'));
  return {
    ...hook,
    fixtures,
    organization,
    directory,
    update,
    remove,
    refreshConnections: () => refreshConnections(),
    refreshDirectory: () => refreshDirectory(),
  };
};

describe('Directory Sync model ownership', () => {
  it('excludes an earlier organization connection while the new organization loads', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });
    const original = fixtures.clerk.organization!;
    original.getEnterpriseConnections.mockResolvedValue([connection('connection_1')]);
    original.getDirectorySync.mockResolvedValue({
      id: 'directory_1',
      organizationId: original.id,
      enterpriseConnectionId: 'connection_1',
      enabled: true,
    } as DirectorySyncResource);
    const { result, rerender } = renderHook(() => useSecurityDirectorySyncModel(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('active'));
    const deferred = createDeferredPromise<EnterpriseConnectionResource[]>();
    const next = {
      ...original,
      id: 'other',
      getEnterpriseConnections: vi.fn(() => deferred.promise),
      getDirectorySync: vi.fn(() => Promise.resolve(null)),
    };
    vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue(next as never);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      organization: next as never,
    };
    rerender();
    expect(result.current.hasSsoConnection).toBe(false);
    expect(result.current.status).toBe('unconfigured');
    expect(next.getDirectorySync).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve([]);
      await deferred.promise;
    });
  });

  it.each(['organizationId', 'enterpriseConnectionId'] as const)(
    'rejects directory data with a different %s',
    async field => {
      const { result, organization, directory, refreshDirectory, update, remove } = await setup();
      organization.getDirectorySync.mockResolvedValue({ ...directory, [field]: 'other' });
      await act(async () => refreshDirectory());
      await waitFor(() => expect(result.current.status).toBe('unconfigured'));
      await result.current.updateEnabled(false);
      await result.current.onDelete();
      expect(update).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    },
  );

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks writes when the canonical %s changes before render',
    async field => {
      const { result, fixtures, update, remove } = await setup();
      const retained = result.current;
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field]!, id: 'other' } as never);
      await retained.updateEnabled(false);
      await retained.onDelete();
      expect(update).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    },
  );

  it('blocks retained writes after unmount', async () => {
    const { result, unmount, update, remove } = await setup();
    const retained = result.current;
    unmount();
    await retained.updateEnabled(false);
    await retained.onDelete();
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('suppresses a late error after the account changes', async () => {
    const { result, fixtures, update } = await setup();
    const deferred = createDeferredPromise<DirectorySyncResource>();
    update.mockReturnValueOnce(deferred.promise);
    const pending = result.current.updateEnabled(false);
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'other' } as never);
    deferred.reject(new Error('Earlier owner failed'));
    await expect(pending).resolves.toBeUndefined();
  });

  it('discards a late result after closure', async () => {
    const { result, unmount, update, directory } = await setup();
    const deferred = createDeferredPromise<DirectorySyncResource>();
    update.mockReturnValueOnce(deferred.promise);
    const pending = result.current.updateEnabled(false);
    unmount();
    deferred.resolve(directory);
    await expect(pending).resolves.toBeUndefined();
  });

  it('does not revive old commands when the account changes back', async () => {
    const { result, fixtures, rerender, update, remove } = await setup();
    const retained = result.current;
    const original = fixtures.clerk.user!;
    const next = { ...original, id: 'other' };
    const spy = vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(next);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user: next };
    rerender();
    spy.mockRestore();
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      user: original,
    };
    rerender();
    await retained.updateEnabled(false);
    await retained.onDelete();
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('blocks commands for a removed connection', async () => {
    const { result, organization, refreshConnections, update, remove } = await setup();
    const retained = result.current;
    organization.getEnterpriseConnections.mockResolvedValue([]);
    await act(async () => refreshConnections());
    await waitFor(() => expect(result.current.hasSsoConnection).toBe(false));
    await retained.updateEnabled(false);
    await retained.onDelete();
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('keeps commands valid for new data with the same directory identity', async () => {
    const { result, organization, directory, refreshDirectory, update } = await setup();
    const retained = result.current;
    organization.getDirectorySync.mockResolvedValue({ ...directory, enabled: false });
    await act(async () => refreshDirectory());
    await waitFor(() => expect(result.current.status).toBe('inactive'));
    await act(async () => {
      await retained.updateEnabled(true);
    });
    expect(update).toHaveBeenCalledWith({ enabled: true });
  });

  it('propagates a current error and permits a later write', async () => {
    const { result, update } = await setup();
    update.mockRejectedValueOnce(new Error('Current owner failed'));
    await expect(result.current.updateEnabled(false)).rejects.toThrow('Current owner failed');
    await act(async () => {
      await result.current.updateEnabled(false);
    });
    expect(update).toHaveBeenCalledTimes(2);
  });
});
