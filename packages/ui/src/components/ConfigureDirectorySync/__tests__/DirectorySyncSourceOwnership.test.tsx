import type { DirectorySyncResource, EnterpriseConnectionResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';

import { useConfigureDirectorySyncContextModel } from '../configure-directory-sync-context.model';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const setup = async (hasDirectory = true) => {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
  });
  const organization = fixtures.clerk.organization!;
  const directory = {
    id: 'directory_1',
    organizationId: organization.id,
    enterpriseConnectionId: 'connection_1',
    provider: 'okta',
    enabled: true,
    attributeMapping: {},
    apiKey: 'secret',
    update: vi.fn(),
    delete: vi.fn(),
    rotateToken: vi.fn(),
    setCredentials: vi.fn(),
    sync: vi.fn(),
  };
  directory.update.mockResolvedValue(directory);
  directory.rotateToken.mockResolvedValue(directory);
  directory.setCredentials.mockResolvedValue(directory);
  organization.getEnterpriseConnections.mockResolvedValue([
    {
      id: 'connection_1',
      name: 'Acme',
      active: true,
      domains: [],
      provider: 'saml_okta',
    } as unknown as EnterpriseConnectionResource,
  ]);
  organization.getDirectorySync.mockResolvedValue(
    hasDirectory ? (directory as unknown as DirectorySyncResource) : null,
  );
  organization.createDirectorySync.mockResolvedValue(directory as unknown as DirectorySyncResource);
  const hook = renderHook(() => useConfigureDirectorySyncContextModel(), { wrapper });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return { ...hook, fixtures, organization, directory };
};

describe('Directory Sync wizard SDK ownership', () => {
  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks wizard commands when the canonical %s changes before render',
    async field => {
      const { result, fixtures, organization, directory } = await setup();
      const retained = result.current;
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field]!, id: 'other' } as never);
      expect(await retained.createDirectory()).toBeNull();
      expect(await retained.rotateToken()).toBeNull();
      await retained.setDirectoryEnabled(false);
      await retained.setCredentials({ serviceAccountJson: '{}', subjectEmail: 'admin@example.com' });
      await retained.syncDirectory();
      expect(organization.createDirectorySync).not.toHaveBeenCalled();
      expect(directory.rotateToken).not.toHaveBeenCalled();
      expect(directory.update).not.toHaveBeenCalled();
      expect(directory.setCredentials).not.toHaveBeenCalled();
      expect(directory.sync).not.toHaveBeenCalled();
    },
  );

  it('blocks commands after the wizard model closes', async () => {
    const { result, unmount, organization, directory } = await setup();
    const retained = result.current;
    unmount();
    expect(await retained.createDirectory()).toBeNull();
    expect(await retained.rotateToken()).toBeNull();
    await retained.syncDirectory();
    expect(organization.createDirectorySync).not.toHaveBeenCalled();
    expect(directory.rotateToken).not.toHaveBeenCalled();
    expect(directory.sync).not.toHaveBeenCalled();
  });

  it('does not return a rotated token after the account changes', async () => {
    const { result, fixtures, directory } = await setup();
    const deferred = createDeferredPromise<DirectorySyncResource>();
    directory.rotateToken.mockReturnValueOnce(deferred.promise);
    const pending = result.current.rotateToken();
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'other' } as never);
    await act(async () => {
      deferred.resolve(directory as unknown as DirectorySyncResource);
      expect(await pending).toBeNull();
    });
  });

  it('suppresses a late credential error after closure', async () => {
    const { result, unmount, directory } = await setup();
    const deferred = createDeferredPromise<DirectorySyncResource>();
    directory.setCredentials.mockReturnValueOnce(deferred.promise);
    const pending = result.current.setCredentials({ serviceAccountJson: '{}', subjectEmail: 'admin@example.com' });
    unmount();
    deferred.reject(new Error('Earlier credentials failed'));
    await expect(pending).resolves.toBeUndefined();
  });

  it('returns the created token after its own directory query becomes configured', async () => {
    const { result, organization, directory } = await setup(false);
    const created = { ...directory, id: 'directory_2', apiKey: 'created_secret' };
    organization.createDirectorySync.mockResolvedValueOnce(created as unknown as DirectorySyncResource);
    organization.getDirectorySync.mockResolvedValue(created as unknown as DirectorySyncResource);
    await act(async () => {
      expect(await result.current.createDirectory()).toEqual({
        enterpriseConnectionId: 'connection_1',
        directoryId: 'directory_2',
        token: 'created_secret',
      });
    });
    await waitFor(() => expect(result.current.directory).toMatchObject({ id: 'directory_2' }));
    expect(result.current.directory).not.toHaveProperty('apiKey');
    expect(result.current.directory).not.toHaveProperty('rotateToken');
  });
});
