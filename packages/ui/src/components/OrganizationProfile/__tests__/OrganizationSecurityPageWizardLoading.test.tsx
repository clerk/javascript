import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, screen } from '@/test/utils';

import { organizationEnterpriseConnection as buildOrganizationEnterpriseConnection } from '../../ConfigureSSO/domain/organizationEnterpriseConnection';

// External, test-controllable loading flag. The mocked umbrella hook reads it
// through `useSyncExternalStore`, so flipping it inside `act` triggers a real
// re-render of the page — exactly how a mid-wizard refetch toggles `isLoading`
// in production (the test-runs query cold-loading after a configure write).
const loadingStore = vi.hoisted(() => {
  let loading = false;
  const listeners = new Set<() => void>();
  return {
    get: () => loading,
    set: (next: boolean) => {
      loading = next;
      listeners.forEach(l => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
});

// An active, fully-configured connection with all domains verified and a
// successful test run. Every wizard step is reachable, so the furthest-reachable
// seed is the last step (`activate`).
const activeConnection = {
  id: 'ent_1',
  name: 'clerk.com',
  provider: 'saml_okta',
  active: true,
  organizationId: 'Org1',
  domains: ['clerk.com'],
  samlConnection: {
    idpSsoUrl: 'https://idp.example.com/sso',
    idpEntityId: 'https://idp.example.com/entity',
    idpCertificate: 'CERT',
  },
} as any;

const verifiedDomain = {
  id: 'dmn_verified',
  name: 'clerk.com',
  organizationId: 'Org1',
  enrollmentMode: 'enterprise_sso',
  ownershipVerification: { status: 'verified', strategy: 'txt' },
} as any;

const noop = () => Promise.resolve(undefined);

// Mock the umbrella hook so the test owns `isLoading` and the connection state
// directly, while the real OrganizationSecurityPage / ConfigureSSOWizard / Wizard
// render. This isolates the bug to the page's loading-vs-view gating.
vi.mock('../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection', () => ({
  useOrganizationEnterpriseConnection: () => {
    const isLoading = React.useSyncExternalStore(loadingStore.subscribe, loadingStore.get, loadingStore.get);
    return {
      isLoading,
      user: { primaryEmailAddress: { emailAddress: 'test@clerk.com' } },
      session: {},
      organization: { name: 'Org1' },
      enterpriseConnection: activeConnection,
      organizationEnterpriseConnection: buildOrganizationEnterpriseConnection({
        connection: activeConnection,
        hasSuccessfulTestRun: true,
      }),
      enterpriseConnectionMutations: {
        createConnection: noop,
        changeProvider: noop,
        updateConnection: noop,
        setConnectionActive: noop,
        deleteConnection: noop,
        createTestRun: noop,
      },
      testRuns: {
        rows: [{ id: 'run_1', status: 'success' }],
        totalCount: 1,
        isLoading: false,
        isFetching: false,
        isPolling: false,
        page: 1,
        setPage: () => {},
        refresh: noop,
      },
      organizationDomains: [verifiedDomain],
      organizationDomainMutations: {
        createDomain: noop,
        prepareOwnershipVerification: noop,
        attemptOwnershipVerification: noop,
        revalidate: noop,
      },
    };
  },
}));

import { OrganizationSecurityPage } from '../OrganizationSecurityPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

const withSecurityPageFixtures = (f: Parameters<Parameters<typeof createFixtures>[0]>[0]) => {
  f.withEnterpriseSso({ selfServeSSO: true });
  f.withEmailAddress();
  f.withOrganizations();
  f.withUser({
    email_addresses: ['test@clerk.com'],
    organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
  });
};

describe('OrganizationSecurityPage — wizard survives a mid-flow loading toggle', () => {
  it('keeps the open wizard on its current step when isLoading flips true→false', async () => {
    loadingStore.set(false);
    const { wrapper } = await createFixtures(withSecurityPageFixtures);

    const { userEvent } = render(<OrganizationSecurityPage contentRef={{ current: null }} />, { wrapper });

    // Enter the wizard from the overview via Edit, which forces the first step.
    await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    expect(await screen.findByRole('heading', { name: /add SSO domains/i })).toBeInTheDocument();

    // Navigate forward to the Activate step via the breadcrumb (reachable because
    // the connection is active). This puts the user on a step OTHER than the
    // forced seed, so a reseat is observable.
    await userEvent.click(screen.getByRole('button', { name: /^Activate$/ }));
    expect(await screen.findByRole('heading', { name: /SSO connection is active/i })).toBeInTheDocument();

    // A transient refetch: isLoading flips true then back to false while the user
    // is mid-wizard. The wizard must NOT unmount and reseat.
    act(() => loadingStore.set(true));
    act(() => loadingStore.set(false));

    // The wizard stays on the Activate step; it did not snap back to the forced
    // first step (Domains). On the unfixed page-level gate the wizard unmounts
    // during the `true` frame and remounts at the forced first step, so the
    // Activate heading is gone and "Add SSO domains" is shown instead.
    expect(screen.getByRole('heading', { name: /SSO connection is active/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /add SSO domains/i })).not.toBeInTheDocument();
  });
});
