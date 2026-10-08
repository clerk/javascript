import type { EnterpriseConnectionResource, OrganizationDomainResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { toConfigureSSOModel } from '../configure-sso.model';
import type { UseOrganizationEnterpriseConnectionResult } from '../hooks/useOrganizationEnterpriseConnection';

const createSource = () => {
  const connection = {
    id: 'ent_1',
    name: 'SSO',
    provider: 'saml_custom',
    domains: ['example.com'],
    active: false,
    oauthConfig: { clientId: 'client', discoveryUrl: 'https://idp.example.com' },
    samlConnection: { idpCertificates: [{ certificate: 'certificate', issuedAt: 1, expiresAt: 2 }] },
    __internal_toSnapshot: vi.fn(),
  } as unknown as EnterpriseConnectionResource;
  const domain = {
    id: 'dmn_1',
    name: 'example.com',
    delete: vi.fn().mockResolvedValue({ deleted: true }),
    ownershipVerification: {
      status: 'unverified',
      expiresAt: new Date(1000),
      verifiedAt: null,
      txtRecordName: '_clerk.example.com',
      txtRecordValue: 'value',
    },
  } as unknown as OrganizationDomainResource;
  const mutations = {
    createConnection: vi.fn().mockResolvedValue(connection),
    changeProvider: vi.fn().mockResolvedValue(connection),
    updateConnection: vi.fn().mockResolvedValue(connection),
    setConnectionActive: vi.fn().mockResolvedValue(connection),
    deleteConnection: vi.fn().mockResolvedValue({ deleted: true }),
    createTestRun: vi.fn().mockResolvedValue({ url: 'https://test.example.com', privateValue: connection }),
  };
  const domains = {
    createDomain: vi.fn().mockResolvedValue(domain),
    prepareOwnershipVerification: vi.fn().mockResolvedValue({ domains: [domain] }),
    attemptOwnershipVerification: vi.fn(),
    revalidate: vi.fn().mockResolvedValue(undefined),
  };
  const source = {
    canRun: () => true,
    ownerKey: 'owner',
    isLoading: false,
    enterpriseConnections: [connection],
    enterpriseConnection: connection,
    organization: { name: 'Example' },
    connectionScope: { kind: 'existing', id: connection.id },
    selectConnection: vi.fn(),
    connectionDomains: ['example.com'],
    setConnectionDomains: vi.fn(),
    claimedDomains: new Map([['other.com', 'Other']]),
    organizationEnterpriseConnection: { status: 'in_progress' },
    enterpriseConnectionMutations: mutations,
    organizationDomains: [domain],
    organizationDomainMutations: domains,
    testRuns: {
      rows: [
        {
          id: 'run_1',
          status: 'failed',
          createdAt: new Date(2000),
          logs: [{ message: 'message', privateValue: connection }],
          parsedUserInfo: { firstName: 'Name' },
          __internal_toSnapshot: vi.fn(),
        },
      ],
      page: 1,
      totalCount: 1,
      isLoading: false,
      isFetching: false,
      isPolling: false,
      setPage: vi.fn(),
      refresh: vi.fn().mockResolvedValue([connection]),
      revalidateHasSuccessfulTestRun: vi.fn(),
    },
  } as unknown as UseOrganizationEnterpriseConnectionResult;
  return { source, connection, domain, mutations, domains };
};

describe('ConfigureSSO model boundary', () => {
  it('does not resolve or delete a domain after the source loses its owner', async () => {
    const { source, domain, domains } = createSource();
    const model = toConfigureSSOModel(source);
    source.canRun = () => false;
    await model.organizationDomainMutations.removeDomain('dmn_1');
    await model.organizationDomainMutations.prepareOwnershipVerification(['missing']);
    expect(domain.delete).not.toHaveBeenCalled();
    expect(domains.prepareOwnershipVerification).not.toHaveBeenCalled();
  });

  it('suppresses a late domain deletion error after the source loses its owner', async () => {
    const { source, domain, domains } = createSource();
    const deferred = createDeferredPromise<void>();
    vi.mocked(domain.delete).mockReturnValue(deferred.promise as never);
    const pending = toConfigureSSOModel(source).organizationDomainMutations.removeDomain('dmn_1');
    source.canRun = () => false;
    deferred.reject(new Error('Earlier domain deletion failed'));
    await expect(pending).resolves.toBeUndefined();
    expect(domains.revalidate).not.toHaveBeenCalled();
  });

  it('copies nested data and excludes SDK methods and unused resource fields', () => {
    const { source, connection, domain } = createSource();
    const model = toConfigureSSOModel(source);
    expect(model).not.toHaveProperty('organization');
    expect(model.enterpriseConnection).not.toHaveProperty('__internal_toSnapshot');
    expect(model.organizationDomains?.[0]).not.toHaveProperty('delete');
    expect(model.testRuns.rows[0]).not.toHaveProperty('__internal_toSnapshot');
    expect(model.testRuns.rows[0].logs[0]).not.toHaveProperty('privateValue');
    model.enterpriseConnection!.domains.push('new.com');
    model.enterpriseConnection!.samlConnection!.idpCertificates[0].certificate = 'changed';
    model.enterpriseConnection!.oauthConfig!.clientId = 'changed';
    model.organizationDomains![0].ownershipVerification!.expiresAt!.setTime(3000);
    model.testRuns.rows[0].logs[0].message = 'changed';
    model.testRuns.rows[0].createdAt!.setTime(4000);
    model.connectionDomains.push('draft.com');
    model.claimedDomains.clear();
    expect(connection.domains).toEqual(['example.com']);
    expect(connection.samlConnection!.idpCertificates[0].certificate).toBe('certificate');
    expect(connection.oauthConfig!.clientId).toBe('client');
    expect(domain.ownershipVerification!.expiresAt!.getTime()).toBe(1000);
    expect(source.testRuns.rows[0].logs[0].message).toBe('message');
    expect(source.testRuns.rows[0].createdAt!.getTime()).toBe(2000);
    expect(source.connectionDomains).toEqual(['example.com']);
    expect(source.claimedDomains.size).toBe(1);
  });

  it('discards write and refresh results and exposes only the test URL', async () => {
    const { source, mutations } = createSource();
    const model = toConfigureSSOModel(source);
    const commands = model.enterpriseConnectionMutations;
    expect(await commands.createConnection('saml_okta')).toBeUndefined();
    expect(await commands.changeProvider('ent_1', 'saml_google')).toBeUndefined();
    expect(await commands.updateConnection('ent_1', { name: 'Updated' })).toBeUndefined();
    expect(await commands.setConnectionActive('ent_1', true)).toBeUndefined();
    expect(await commands.deleteConnection('ent_1')).toBeUndefined();
    expect(await model.organizationDomainMutations.createDomain('new.com')).toBeUndefined();
    expect(await model.testRuns.refresh({ armPolling: true })).toBeUndefined();
    expect(source.testRuns.refresh).toHaveBeenCalledWith({ armPolling: true });
    expect(await commands.createTestRun('ent_1')).toEqual({ url: 'https://test.example.com' });
    expect(mutations.updateConnection).toHaveBeenCalledWith('ent_1', { name: 'Updated' });
  });

  it('resolves domain IDs privately and refreshes only after successful removal', async () => {
    const { source, domain, domains } = createSource();
    const model = toConfigureSSOModel(source);
    expect(await model.organizationDomainMutations.prepareOwnershipVerification(['dmn_1'])).toBeUndefined();
    expect(domains.prepareOwnershipVerification).toHaveBeenCalledWith([domain]);
    expect(await model.organizationDomainMutations.removeDomain('dmn_1')).toBeUndefined();
    expect(domain.delete).toHaveBeenCalledOnce();
    expect(domains.revalidate).toHaveBeenCalledOnce();
    domains.revalidate.mockClear();
    vi.mocked(domain.delete).mockRejectedValueOnce(new Error('Cannot remove'));
    await expect(model.organizationDomainMutations.removeDomain('dmn_1')).rejects.toThrow('Cannot remove');
    expect(domains.revalidate).not.toHaveBeenCalled();
    await expect(model.organizationDomainMutations.prepareOwnershipVerification(['missing'])).rejects.toThrow(
      'Organization domain not found',
    );
    expect(domains.prepareOwnershipVerification).toHaveBeenCalledOnce();
  });
});
