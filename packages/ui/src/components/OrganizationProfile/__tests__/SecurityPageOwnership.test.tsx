import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';

import type { SSOConnection } from '../../ConfigureSSO/configure-sso.types';
import { organizationEnterpriseConnection } from '../../ConfigureSSO/domain/organizationEnterpriseConnection';
import { useOrganizationSecurityPageController } from '../organization-security-page.controller';
import { useOrganizationSecurityPageModel } from '../organization-security-page.model';

const connection: SSOConnection = {
  id: 'connection',
  name: 'SSO',
  provider: 'saml_custom',
  active: false,
  logoPublicUrl: null,
  domains: [],
  syncUserAttributes: false,
  disableAdditionalIdentifications: false,
  oauthConfig: null,
  samlConnection: null,
};
const makeModel = () => ({
  ownerKey: 'first-owner',
  canRun: vi.fn(() => true),
  isLoading: false,
  organizationName: 'Organization',
  enterpriseConnections: [connection],
  enterpriseConnection: connection,
  connectionScope: { kind: 'existing' as const, id: connection.id },
  selectConnection: vi.fn(),
  connectionDomains: [],
  setConnectionDomains: vi.fn().mockResolvedValue(undefined),
  claimedDomains: new Map<string, string>(),
  organizationEnterpriseConnection: organizationEnterpriseConnection({
    connection: undefined,
    hasSuccessfulTestRun: false,
  }),
  enterpriseConnectionMutations: {
    createConnection: vi.fn().mockResolvedValue(undefined),
    changeProvider: vi.fn().mockResolvedValue(undefined),
    updateConnection: vi.fn().mockResolvedValue(undefined),
    setConnectionActive: vi.fn().mockResolvedValue(undefined),
    deleteConnection: vi.fn().mockResolvedValue(undefined),
    createTestRun: vi.fn().mockResolvedValue(undefined),
  },
  testRuns: {
    rows: [],
    totalCount: 0,
    isLoading: false,
    isFetching: false,
    isPolling: false,
    page: 1,
    setPage: vi.fn(),
    refresh: vi.fn().mockResolvedValue(undefined),
    revalidateHasSuccessfulTestRun: vi.fn().mockResolvedValue(false),
  },
  organizationDomains: [],
  organizationDomainMutations: {
    createDomain: vi.fn().mockResolvedValue(undefined),
    prepareOwnershipVerification: vi.fn().mockResolvedValue(undefined),
    removeDomain: vi.fn().mockResolvedValue(undefined),
  },
  canManageConnections: true,
  showDirectorySync: true,
  showSSOBypass: true,
});

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('Security page ownership', () => {
  it('blocks an overview action retained before permission was removed', () => {
    const model = makeModel();
    const { result, rerender } = renderHook(props => useOrganizationSecurityPageController(props), {
      initialProps: model,
    });
    const retained = result.current.openWizard;
    rerender({ ...model, canManageConnections: false });
    act(() => retained({ kind: 'new' }));
    expect(model.selectConnection).not.toHaveBeenCalled();
    expect(result.current.view.kind).toBe('overview');
  });

  it('keeps the wizard open when another page becomes available', () => {
    const model = { ...makeModel(), showSSOBypass: false };
    const { result, rerender } = renderHook(props => useOrganizationSecurityPageController(props), {
      initialProps: model,
    });
    act(() => result.current.openWizard({ kind: 'new' }));
    rerender({ ...model, showSSOBypass: true });
    expect(result.current.view.kind).toBe('wizard');
  });

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks page navigation through the real model after the canonical %s changes',
    async field => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
        });
      });
      fixtures.clerk.organization!.getEnterpriseConnections.mockResolvedValue([connection as never]);
      fixtures.clerk.organization!.getDomains.mockResolvedValue({ data: [], total_count: 0 });
      const { result } = renderHook(() => useOrganizationSecurityPageController(useOrganizationSecurityPageModel()), {
        wrapper,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.canManageConnections).toBe(true);
      expect(result.current.canRun()).toBe(true);
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field]!, id: 'replacement' } as never);
      act(() => result.current.openWizard({ kind: 'new' }));
      expect(result.current.view.kind).toBe('overview');
    },
  );

  it('resets an open wizard after an owner changes and does not restore it when the owner returns', () => {
    const model = makeModel();
    const { result, rerender } = renderHook(props => useOrganizationSecurityPageController(props), {
      initialProps: model,
    });
    act(() => result.current.openWizard({ kind: 'new' }));
    expect(result.current.view.kind).toBe('wizard');
    rerender({ ...model, ownerKey: 'second-owner' });
    expect(result.current.view.kind).toBe('overview');
    rerender(model);
    expect(result.current.view.kind).toBe('overview');
  });

  it('blocks retained actions after an owner changes without render', () => {
    const model = makeModel();
    const { result } = renderHook(() => useOrganizationSecurityPageController(model));
    model.canRun.mockReturnValue(false);
    act(() => {
      result.current.openWizard({ kind: 'new' });
      result.current.openConnection(connection.id);
      result.current.openDirectorySync();
      result.current.openSSOBypass();
    });
    expect(model.selectConnection).not.toHaveBeenCalled();
    expect(result.current.view.kind).toBe('overview');
  });

  it('blocks retained actions after the page closes', () => {
    const model = makeModel();
    const { result, unmount } = renderHook(() => useOrganizationSecurityPageController(model));
    const retained = result.current;
    unmount();
    retained.openWizard({ kind: 'new' });
    expect(model.selectConnection).not.toHaveBeenCalled();
  });

  it('does not let an earlier wizard exit a later flow', () => {
    const model = makeModel();
    const { result } = renderHook(() => useOrganizationSecurityPageController(model));
    act(() => result.current.openWizard({ kind: 'new' }));
    const earlierExit = result.current.exitToOverview;
    act(() => result.current.exitToOverview());
    act(() => result.current.openDirectorySync());
    act(() => earlierExit());
    expect(result.current.view.kind).toBe('directorySync');
  });

  it('does not restore a removed connection page when the connection returns', () => {
    const model = makeModel();
    const { result, rerender } = renderHook(props => useOrganizationSecurityPageController(props), {
      initialProps: model,
    });
    act(() => result.current.openConnection(connection.id));
    rerender({ ...model, enterpriseConnections: [] });
    expect(result.current.view.kind).toBe('overview');
    rerender(model);
    expect(result.current.view.kind).toBe('overview');
  });

  it('closes the wizard when its permission is removed', () => {
    const model = makeModel();
    const { result, rerender } = renderHook(props => useOrganizationSecurityPageController(props), {
      initialProps: model,
    });
    act(() => result.current.openWizard({ kind: 'new' }));
    rerender({ ...model, canManageConnections: false });
    expect(result.current.view.kind).toBe('overview');
  });
});
