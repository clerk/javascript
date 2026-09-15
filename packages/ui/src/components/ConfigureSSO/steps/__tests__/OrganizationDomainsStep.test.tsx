import type { OrganizationDomainResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

const goNext = vi.fn();
const goPrev = vi.fn();

vi.mock('../../elements/Wizard/WizardContext', () => ({
  useWizard: () => ({ current: 'verify-domain', goNext, goPrev, isFirstStep: true, isLastStep: false }),
}));

const setConnectionDomains = vi.fn();

const contextState = vi.hoisted(() => ({
  enterpriseConnection: undefined as { id: string; name: string; active: boolean; domains: string[] } | undefined,
  connectionDomains: [] as string[],
  claimedDomains: new Map<string, string>(),
  organizationDomains: [] as OrganizationDomainResource[],
}));

vi.mock('../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: contextState.enterpriseConnection,
    connectionDomains: contextState.connectionDomains,
    setConnectionDomains,
    claimedDomains: contextState.claimedDomains,
    organizationDomains: contextState.organizationDomains,
    organizationEnterpriseConnection: { status: 'unconfigured' },
    contentRef: { current: null },
    organizationDomainMutations: {
      createDomain: vi.fn(),
      revalidate: vi.fn(),
      prepareOwnershipVerification: vi.fn(),
    },
  }),
}));

import { OrganizationDomainsStep } from '../OrganizationDomainsStep';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

const domain = (name: string, status: 'verified' | 'unverified' = 'verified'): OrganizationDomainResource =>
  ({
    id: `dmn_${name}`,
    name,
    ownershipVerification: { status, strategy: 'txt', verifiedAt: status === 'verified' ? new Date() : null },
  }) as unknown as OrganizationDomainResource;

const resetMocks = () => {
  goNext.mockReset();
  setConnectionDomains.mockReset();
  setConnectionDomains.mockResolvedValue(undefined);
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
    expect(screen.getByText('Used by Google Workspace')).toBeInTheDocument();
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
