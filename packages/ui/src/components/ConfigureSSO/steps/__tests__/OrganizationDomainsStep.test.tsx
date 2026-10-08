import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

const goNext = vi.fn();
const goPrev = vi.fn();

vi.mock('../../elements/Wizard/WizardContext', () => ({
  useWizard: () => ({ current: 'verify-domain', goNext, goPrev, isFirstStep: true, isLastStep: false }),
}));

const setConnectionDomains = vi.fn();
const removeDomain = vi.fn();
const prepareOwnershipVerification = vi.fn();
const canRun = vi.fn(() => true);

const contextState = vi.hoisted(() => ({
  ownerKey: 'owner',
  enterpriseConnection: undefined as { id: string; name: string; active: boolean; domains: string[] } | undefined,
  connectionDomains: [] as string[],
  claimedDomains: new Map<string, string>(),
  organizationDomains: [] as SSODomain[],
}));

vi.mock('../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    ownerKey: contextState.ownerKey,
    canRun,
    enterpriseConnection: contextState.enterpriseConnection,
    connectionDomains: contextState.connectionDomains,
    setConnectionDomains,
    claimedDomains: contextState.claimedDomains,
    organizationDomains: contextState.organizationDomains,
    organizationEnterpriseConnection: { status: 'unconfigured' },
    contentRef: { current: null },
    organizationDomainMutations: {
      createDomain: vi.fn(),
      removeDomain,
      prepareOwnershipVerification,
    },
  }),
}));

import type { SSODomain } from '../../configure-sso.types';
import { useOrganizationDomainsStepModel } from '../organization-domains-step.model';
import { OrganizationDomainsStep } from '../OrganizationDomainsStep';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

const domain = (name: string, status: 'verified' | 'unverified' = 'verified'): SSODomain => ({
  id: `dmn_${name}`,
  name,
  ownershipVerification: {
    status,
    verifiedAt: status === 'verified' ? new Date() : null,
    expiresAt: null,
    txtRecordName: null,
    txtRecordValue: null,
  },
});

const resetMocks = () => {
  goNext.mockReset();
  canRun.mockReturnValue(true);
  contextState.ownerKey = 'owner';
  setConnectionDomains.mockReset();
  setConnectionDomains.mockResolvedValue(undefined);
  removeDomain.mockReset();
  removeDomain.mockResolvedValue(undefined);
  prepareOwnershipVerification.mockReset();
  prepareOwnershipVerification.mockResolvedValue(undefined);
  contextState.enterpriseConnection = undefined;
  contextState.connectionDomains = [];
  contextState.claimedDomains = new Map();
  contextState.organizationDomains = [];
};

const renderStep = async () => {
  const { wrapper } = await createFixtures(f => {
    f.withEnterpriseSso({ selfServeSSO: true });
    f.withEmailAddress();
    f.withOrganizations();
    f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1' }] });
  });

  return render(
    <CardStateProvider>
      <OrganizationDomainsStep />
    </CardStateProvider>,
    { wrapper },
  );
};

describe('OrganizationDomainsStep domain selection', () => {
  it('blocks an earlier removal command after the selected connection changes', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    contextState.connectionDomains = ['acme.com', 'other.com'];
    const { result, rerender } = renderHook(() => useOrganizationDomainsStepModel(), { wrapper });
    const retained = result.current.removeDomain;
    contextState.enterpriseConnection = { id: 'second', name: 'Second', active: false, domains: [] };
    rerender();
    await retained(domain('acme.com'));
    expect(setConnectionDomains).not.toHaveBeenCalled();
    expect(removeDomain).not.toHaveBeenCalled();
  });

  it('does not delete after a pending selection write loses its connection', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    contextState.connectionDomains = ['acme.com', 'other.com'];
    const pending = createDeferredPromise<void>();
    setConnectionDomains.mockReturnValueOnce(pending.promise);
    const { result, rerender } = renderHook(() => useOrganizationDomainsStepModel(), { wrapper });
    const completion = result.current.removeDomain(domain('acme.com'));
    contextState.enterpriseConnection = { id: 'second', name: 'Second', active: false, domains: [] };
    rerender();
    await act(async () => {
      pending.resolve();
      await completion;
    });
    expect(removeDomain).not.toHaveBeenCalled();
  });

  it('suppresses a late selection error after the removal owner changes', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    contextState.connectionDomains = ['acme.com', 'other.com'];
    const pending = createDeferredPromise<void>();
    setConnectionDomains.mockReturnValueOnce(pending.promise);
    const { result, rerender } = renderHook(() => useOrganizationDomainsStepModel(), { wrapper });
    const completion = result.current.removeDomain(domain('acme.com'));
    contextState.ownerKey = 'other';
    rerender();
    pending.reject(new Error('Earlier selection failed'));
    await expect(completion).resolves.toBeUndefined();
    expect(removeDomain).not.toHaveBeenCalled();
  });

  it('blocks retained model commands after the step closes', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { result, unmount } = renderHook(() => useOrganizationDomainsStepModel(), { wrapper });
    const retained = result.current;
    unmount();
    await retained.removeDomain(domain('acme.com'));
    await retained.prepareDomainOwnershipVerification('domain');
    await retained.toggleDomain('acme.com', true);
    expect(removeDomain).not.toHaveBeenCalled();
    expect(setConnectionDomains).not.toHaveBeenCalled();
    expect(prepareOwnershipVerification).not.toHaveBeenCalled();
  });

  it('uses current domain selection when an earlier removal command is confirmed', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const selectedDomain = domain('acme.com');
    contextState.connectionDomains = ['acme.com', 'old.com'];
    const { result, rerender } = renderHook(() => useOrganizationDomainsStepModel(), { wrapper });
    const remove = result.current.removeDomain;
    contextState.connectionDomains = ['acme.com', 'current.com'];
    rerender();
    await act(async () => {
      await remove(selectedDomain);
    });
    expect(setConnectionDomains).toHaveBeenCalledWith(['current.com']);
    expect(removeDomain).toHaveBeenCalledWith(selectedDomain.id);
    expect(setConnectionDomains.mock.invocationCallOrder[0]).toBeLessThan(removeDomain.mock.invocationCallOrder[0]);
    await act(async () => {
      await result.current.prepareDomainOwnershipVerification(selectedDomain.id);
    });
    expect(prepareOwnershipVerification).toHaveBeenCalledWith([selectedDomain.id]);
  });

  it('keeps the domain when updating the connection selection fails', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    contextState.connectionDomains = ['acme.com', 'other.com'];
    setConnectionDomains.mockRejectedValueOnce(new Error('Cannot update'));
    const { result } = renderHook(() => useOrganizationDomainsStepModel(), { wrapper });
    await act(async () => {
      await expect(result.current.removeDomain(domain('acme.com'))).rejects.toThrow('Cannot update');
    });
    expect(removeDomain).not.toHaveBeenCalled();
  });

  it('checks the domains the connection covers and lets the admin toggle a verified one', async () => {
    resetMocks();
    contextState.organizationDomains = [domain('acme.com'), domain('example.com')];
    contextState.connectionDomains = ['acme.com'];

    const { userEvent } = await renderStep();

    expect(screen.getByRole('checkbox', { name: 'Use acme.com for this connection' })).toBeChecked();
    const example = screen.getByRole('checkbox', { name: 'Use example.com for this connection' });
    expect(example).not.toBeChecked();

    await userEvent.click(example);

    expect(setConnectionDomains).toHaveBeenCalledWith(['acme.com', 'example.com']);
  });

  it('disables a domain another connection already authenticates and names that connection', async () => {
    resetMocks();
    contextState.organizationDomains = [domain('acme.com'), domain('taken.com')];
    contextState.connectionDomains = ['acme.com'];
    contextState.claimedDomains = new Map([['taken.com', 'Google Workspace']]);

    await renderStep();

    expect(screen.getByRole('checkbox', { name: 'Use taken.com for this connection' })).toBeDisabled();
    expect(screen.getByText('Used by another connection')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Use acme.com for this connection' })).toBeEnabled();
  });

  it('keeps an unverified domain unselectable until it verifies', async () => {
    resetMocks();
    contextState.organizationDomains = [domain('pending.com', 'unverified')];

    await renderStep();

    expect(screen.getByRole('checkbox', { name: 'Use pending.com for this connection' })).toBeDisabled();
  });

  it('gates Continue on the connection having at least one domain, not on every organization domain', async () => {
    resetMocks();
    contextState.organizationDomains = [domain('acme.com'), domain('pending.com', 'unverified')];
    contextState.connectionDomains = [];

    const { userEvent, unmount } = await renderStep();

    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
    unmount();

    contextState.connectionDomains = ['acme.com'];
    await renderStep();

    const button = screen.getByRole('button', { name: /Continue/i });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(goNext).toHaveBeenCalled();
  });

  it('locks the last domain of an existing connection so it cannot be deselected', async () => {
    resetMocks();
    contextState.enterpriseConnection = { id: 'ent_1', name: 'Okta', active: false, domains: ['acme.com'] };
    contextState.organizationDomains = [domain('acme.com'), domain('example.com')];
    contextState.connectionDomains = ['acme.com'];

    await renderStep();

    expect(screen.getByRole('checkbox', { name: 'Use acme.com for this connection' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Use example.com for this connection' })).toBeEnabled();
  });
});
