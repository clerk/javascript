import { ClerkAPIResponseError } from '@clerk/shared/error';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrganizationEnterpriseConnection } from '@/components/ConfigureSSO/domain/organizationEnterpriseConnection';

import { useOrganizationProfileSecurityPanelController } from '../organization-profile-security-panel.controller';

let isOrganizationLoaded: boolean;
let isSessionLoaded: boolean;
let hasEnvironment: boolean;
let selfServeSSOFeature: boolean;
let selfServeSSOEnabled: boolean;
let canManage: boolean;
let organizationName: string;

let enterpriseConnection: { id: string; domains: string[] } | undefined;
let connectionEntity: OrganizationEnterpriseConnection;
let organizationDomains:
  | Array<{ id?: string; name?: string; delete?: () => Promise<void>; ownershipVerification?: { status: string } }>
  | undefined;

let setConnectionActive: ReturnType<typeof vi.fn>;
let deleteConnection: ReturnType<typeof vi.fn>;
let updateConnection: ReturnType<typeof vi.fn>;
let createTestRunMutation: ReturnType<typeof vi.fn>;
let refreshTestRuns: ReturnType<typeof vi.fn>;
let setTestRunsPage: ReturnType<typeof vi.fn>;
let revalidateHasSuccessfulTestRun: ReturnType<typeof vi.fn>;
let revalidateDomains: ReturnType<typeof vi.fn>;
let deleteDomain: ReturnType<typeof vi.fn>;
/** Records the order of the remove-domain side effects so the test can assert the sequence. */
let removeDomainCalls: string[];
let provider: 'saml_okta' | undefined;

const buildEntity = (overrides: Partial<OrganizationEnterpriseConnection> = {}): OrganizationEnterpriseConnection => ({
  provider: undefined,
  hasConnection: false,
  isActive: false,
  hasMinimumConfiguration: false,
  hasSuccessfulTestRun: false,
  status: 'unconfigured',
  ...overrides,
});

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useOrganization: () => ({
      isLoaded: isOrganizationLoaded,
      organization: { id: 'org_1', name: organizationName, selfServeSSOEnabled },
    }),
    useSession: () => ({
      isLoaded: isSessionLoaded,
      session: isSessionLoaded
        ? {
            id: 'sess_1',
            checkAuthorization: ({ permission }: { permission: string }) =>
              permission === 'org:sys_entconns:manage' ? canManage : false,
          }
        : undefined,
    }),
    useClerk: () => ({ telemetry: { record: vi.fn() } }),
  };
});

vi.mock('../../hooks/useMosaicEnvironment', () => ({
  useMosaicEnvironment: () =>
    hasEnvironment ? { userSettings: { enterpriseSSO: { self_serve_sso: selfServeSSOFeature } } } : undefined,
}));

vi.mock('@/components/ConfigureSSO/hooks/useOrganizationEnterpriseConnection', () => ({
  useOrganizationEnterpriseConnection: () => ({
    isLoading: false,
    user: { primaryEmailAddress: { emailAddress: 'admin@acme.com' } },
    organization: { id: 'org_1' },
    enterpriseConnection,
    organizationEnterpriseConnection: { ...connectionEntity, provider: provider ?? connectionEntity.provider },
    organizationDomains,
    enterpriseConnectionMutations: {
      setConnectionActive,
      deleteConnection,
      updateConnection,
      createConnection: vi.fn().mockResolvedValue(undefined),
      changeProvider: vi.fn().mockResolvedValue(undefined),
      createTestRun: createTestRunMutation,
    },
    testRuns: {
      rows: [],
      totalCount: 0,
      isLoading: false,
      isFetching: false,
      isPolling: false,
      page: 1,
      setPage: setTestRunsPage,
      refresh: refreshTestRuns,
      revalidateHasSuccessfulTestRun,
    },
    organizationDomainMutations: {
      createDomain: vi.fn().mockResolvedValue(undefined),
      prepareOwnershipVerification: vi.fn().mockResolvedValue(undefined),
      revalidate: revalidateDomains,
    },
  }),
}));

beforeEach(() => {
  isOrganizationLoaded = true;
  isSessionLoaded = true;
  hasEnvironment = true;
  selfServeSSOFeature = true;
  selfServeSSOEnabled = true;
  canManage = true;
  organizationName = 'Acme Inc';
  enterpriseConnection = { id: 'ent_1', domains: ['acme.com'] };
  connectionEntity = buildEntity({ hasConnection: true, isActive: true, status: 'active' });
  organizationDomains = [{ ownershipVerification: { status: 'verified' } }];
  provider = undefined;
  setConnectionActive = vi.fn().mockResolvedValue(undefined);
  deleteConnection = vi.fn().mockResolvedValue(undefined);
  updateConnection = vi.fn().mockResolvedValue(undefined);
  createTestRunMutation = vi.fn().mockResolvedValue({ url: 'https://example.com/test' });
  refreshTestRuns = vi.fn().mockResolvedValue(undefined);
  setTestRunsPage = vi.fn();
  revalidateHasSuccessfulTestRun = vi.fn().mockResolvedValue(false);
  revalidateDomains = vi.fn().mockResolvedValue(undefined);
  removeDomainCalls = [];
  deleteDomain = vi.fn(() => {
    removeDomainCalls.push('delete');
    return Promise.resolve();
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationProfileSecurityPanelController();
  if (controller.status !== 'ready') {
    return <output data-testid='state'>{controller.status}</output>;
  }
  return (
    <div>
      <output data-testid='state'>ready</output>
      <output data-testid='mode'>{controller.mode}</output>
      <output data-testid='org-name'>{controller.organizationName}</output>
      <output data-testid='status'>{controller.connection.status}</output>
      <output data-testid='overview-state'>{controller.overview.snapshot.value}</output>
      <output data-testid='overview-error'>{controller.overview.snapshot.context.error ?? ''}</output>
      <output data-testid='can-confirm-remove'>{String(controller.overview.canConfirmRemove)}</output>
      <output data-testid='wizard-state'>{controller.wizard.snapshot.value}</output>
      <button onClick={() => controller.overview.send({ type: 'ACTIVATE' })}>Activate</button>
      <button onClick={() => controller.overview.send({ type: 'DEACTIVATE' })}>Deactivate</button>
      <button onClick={() => controller.overview.send({ type: 'OPEN_REMOVE' })}>Open remove</button>
      <button onClick={() => controller.overview.send({ type: 'TYPE_CONFIRMATION', value: 'Acme Inc' })}>
        Type match
      </button>
      <button onClick={() => controller.overview.send({ type: 'TYPE_CONFIRMATION', value: 'nope' })}>
        Type mismatch
      </button>
      <button onClick={() => controller.overview.send({ type: 'CONFIRM_REMOVE' })}>Confirm remove</button>
      <button onClick={() => controller.openWizard(true)}>Open wizard forced</button>
      <button onClick={() => controller.openWizard()}>Open wizard</button>
      <button onClick={() => controller.exitWizard()}>Exit wizard</button>

      <output data-testid='configure-state'>{controller.configureStep.snapshot.value}</output>
      <output data-testid='test-state'>{controller.testStep.snapshot.value}</output>
      <output data-testid='activate-state'>{controller.activateStep.snapshot.value}</output>
      <button onClick={() => controller.configureStep.send({ type: 'NEXT_INNER' })}>configure next</button>
      <button onClick={() => controller.configureStep.send({ type: 'SAVE', payload: {} })}>configure save</button>
      <button onClick={() => controller.testStep.send({ type: 'CREATE_RUN' })}>test create run</button>
      <button onClick={() => void controller.testStep.testRuns.refresh()}>test manual refresh</button>
      <button onClick={() => controller.testStep.send({ type: 'CONTINUE' })}>test continue</button>
      <button onClick={() => controller.activateStep.send({ type: 'ACTIVATE' })}>activate step</button>
      <button
        onClick={() =>
          controller.domainsStep.remove.send({ type: 'OPEN', domainName: 'acme.com', isConnectionActive: false })
        }
      >
        remove open
      </button>
      <button onClick={() => controller.domainsStep.remove.send({ type: 'CONFIRM' })}>remove confirm</button>
    </div>
  );
}

describe('useOrganizationProfileSecurityPanelController — gating', () => {
  it('is loading until the organization is loaded', () => {
    isOrganizationLoaded = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is loading until the session is loaded', () => {
    isSessionLoaded = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is loading until the environment resolves', () => {
    hasEnvironment = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is hidden when the enterprise-SSO feature flag is off', () => {
    selfServeSSOFeature = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is hidden when the organization has self-serve SSO disabled', () => {
    selfServeSSOEnabled = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is hidden when the user cannot manage enterprise connections', () => {
    canManage = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is ready with the overview when gating passes', () => {
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(screen.getByTestId('mode')).toHaveTextContent('overview');
    expect(screen.getByTestId('org-name')).toHaveTextContent('Acme Inc');
    expect(screen.getByTestId('status')).toHaveTextContent('active');
  });
});

describe('useOrganizationProfileSecurityPanelController — overview mutation wiring', () => {
  it('activates the connection via setConnectionActive(id, true)', async () => {
    connectionEntity = buildEntity({
      hasConnection: true,
      status: 'inactive',
      hasMinimumConfiguration: true,
      hasSuccessfulTestRun: true,
    });
    render(<Harness />);

    await act(async () => {
      fireEvent.click(screen.getByText('Activate'));
    });

    expect(setConnectionActive).toHaveBeenCalledWith('ent_1', true);
    expect(screen.getByTestId('overview-state')).toHaveTextContent('idle');
  });

  it('deactivates the connection via setConnectionActive(id, false)', async () => {
    render(<Harness />);

    await act(async () => {
      fireEvent.click(screen.getByText('Deactivate'));
    });

    expect(setConnectionActive).toHaveBeenCalledWith('ent_1', false);
    expect(screen.getByTestId('overview-state')).toHaveTextContent('idle');
  });

  it('removes the connection only after a matching type-to-confirm', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('Open remove'));
    expect(screen.getByTestId('overview-state')).toHaveTextContent('confirmingRemove');

    // A mismatch keeps the guard closed.
    fireEvent.click(screen.getByText('Type mismatch'));
    expect(screen.getByTestId('can-confirm-remove')).toHaveTextContent('false');
    fireEvent.click(screen.getByText('Confirm remove'));
    expect(deleteConnection).not.toHaveBeenCalled();

    // A match opens the guard and the confirm deletes the connection.
    fireEvent.click(screen.getByText('Type match'));
    expect(screen.getByTestId('can-confirm-remove')).toHaveTextContent('true');

    await act(async () => {
      fireEvent.click(screen.getByText('Confirm remove'));
    });

    expect(deleteConnection).toHaveBeenCalledWith('ent_1');
    expect(screen.getByTestId('overview-state')).toHaveTextContent('idle');
  });

  it('surfaces the first global Clerk error message when a mutation fails', async () => {
    setConnectionActive.mockRejectedValueOnce(
      new ClerkAPIResponseError('request failed', {
        data: [
          {
            code: 'cannot_deactivate',
            message: 'Cannot deactivate',
            long_message: 'Cannot deactivate the only connection',
          },
        ],
        status: 422,
      }),
    );
    render(<Harness />);

    await act(async () => {
      fireEvent.click(screen.getByText('Deactivate'));
    });

    expect(screen.getByTestId('overview-error')).toHaveTextContent('Cannot deactivate the only connection');
    expect(screen.getByTestId('overview-state')).toHaveTextContent('idle');
  });
});

describe('useOrganizationProfileSecurityPanelController — mode toggle', () => {
  it('opens and exits the wizard', () => {
    render(<Harness />);
    expect(screen.getByTestId('mode')).toHaveTextContent('overview');

    fireEvent.click(screen.getByText('Open wizard'));
    expect(screen.getByTestId('mode')).toHaveTextContent('wizard');

    fireEvent.click(screen.getByText('Exit wizard'));
    expect(screen.getByTestId('mode')).toHaveTextContent('overview');
  });

  it('forces the wizard back to the first step when opened with forceInitialStep', () => {
    // Domains verified → the wizard seats at `configure`; a forced open jumps back to step 0.
    connectionEntity = buildEntity();
    render(<Harness />);
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('configure');

    fireEvent.click(screen.getByText('Open wizard forced'));
    expect(screen.getByTestId('mode')).toHaveTextContent('wizard');
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('verify-domain');
  });
});

describe('useOrganizationProfileSecurityPanelController — wizard reachability + recheck', () => {
  it('seats the wizard at the furthest reachable step from live connection data', () => {
    // Domains verified + configured but no successful test run → configure and test reachable,
    // activate closed → seat at `test`.
    connectionEntity = buildEntity({ hasConnection: true, hasMinimumConfiguration: true, status: 'in_progress' });
    render(<Harness />);
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('test');
  });

  it('re-seats the wizard when reachability data changes underneath it', () => {
    connectionEntity = buildEntity({ hasConnection: true, hasMinimumConfiguration: true, status: 'in_progress' });
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('test');

    // The connection is removed elsewhere; domains stay verified so `configure` is still reachable.
    enterpriseConnection = undefined;
    connectionEntity = buildEntity();
    rerender(<Harness />);
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('configure');
  });
});

describe('useOrganizationProfileSecurityPanelController — test-step polling arm distinction', () => {
  it('arms polling when a run is created: createTestRun(id) → setPage(1) → refresh({armPolling:true}) → open the URL', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<Harness />);

    await act(async () => {
      fireEvent.click(screen.getByText('test create run'));
    });

    expect(createTestRunMutation).toHaveBeenCalledWith('ent_1');
    expect(setTestRunsPage).toHaveBeenCalledWith(1);
    expect(refreshTestRuns).toHaveBeenCalledWith({ armPolling: true });
    expect(open).toHaveBeenCalledWith('https://example.com/test', '_blank', 'noopener,noreferrer');

    open.mockRestore();
  });

  it('does NOT arm polling on the manual "Refresh logs" refetch (a bare refresh() the view threads through)', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('test manual refresh'));

    expect(refreshTestRuns).toHaveBeenCalledTimes(1);
    // No `{ armPolling: true }` — the manual refetch is the raw hook refresh, not the create-run arm.
    expect(refreshTestRuns).toHaveBeenCalledWith();
  });
});

describe('useOrganizationProfileSecurityPanelController — terminal bubble seams', () => {
  it('forwards the configure terminal-save bubble to the outer wizard, landing on test once the config revalidates', async () => {
    provider = 'saml_okta';
    // Domains verified, connection present but not yet minimally configured → wizard at configure.
    connectionEntity = buildEntity({ hasConnection: true, status: 'in_progress' });
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('configure');
    expect(screen.getByTestId('configure-state')).toHaveTextContent('configuring');

    // Walk the inner SAML steps to the terminal metadata step (Okta submit index 3) and save.
    fireEvent.click(screen.getByText('configure next'));
    fireEvent.click(screen.getByText('configure next'));
    fireEvent.click(screen.getByText('configure next'));
    await act(async () => {
      fireEvent.click(screen.getByText('configure save'));
    });

    // The terminal save bubbles; the controller forwards NEXT but the outer wizard parks it on the
    // still-stale test guard (hasMinimumConfiguration not yet revalidated).
    expect(screen.getByTestId('configure-state')).toHaveTextContent('bubblingNext');
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('configure');

    // The updateConnection revalidate lands: config is now minimal → recheck completes the parked advance.
    connectionEntity = buildEntity({ hasConnection: true, hasMinimumConfiguration: true, status: 'in_progress' });
    rerender(<Harness />);
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('test');
  });

  it('forwards the test-continue bubble to the outer wizard, landing on activate once the success probe revalidates', async () => {
    connectionEntity = buildEntity({ hasConnection: true, hasMinimumConfiguration: true, status: 'in_progress' });
    revalidateHasSuccessfulTestRun.mockResolvedValue(true);
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('test');

    await act(async () => {
      fireEvent.click(screen.getByText('test continue'));
    });

    // Continue found a fresh successful run → bubbles; the outer wizard parks NEXT on the stale
    // activate guard (hasSuccessfulTestRun not yet reseated into wizard context).
    expect(screen.getByTestId('test-state')).toHaveTextContent('bubblingNext');
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('test');

    connectionEntity = buildEntity({
      hasConnection: true,
      hasMinimumConfiguration: true,
      hasSuccessfulTestRun: true,
      status: 'in_progress',
    });
    rerender(<Harness />);
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('activate');
  });

  it('returns to the overview after the activate step completes (activate onDone → activated → overview)', async () => {
    connectionEntity = buildEntity({
      hasConnection: true,
      hasMinimumConfiguration: true,
      hasSuccessfulTestRun: true,
      status: 'in_progress',
    });
    render(<Harness />);
    expect(screen.getByTestId('wizard-state')).toHaveTextContent('activate');

    fireEvent.click(screen.getByText('Open wizard'));
    expect(screen.getByTestId('mode')).toHaveTextContent('wizard');

    await act(async () => {
      fireEvent.click(screen.getByText('activate step'));
    });

    expect(setConnectionActive).toHaveBeenCalledWith('ent_1', true);
    expect(screen.getByTestId('activate-state')).toHaveTextContent('activated');
    expect(screen.getByTestId('mode')).toHaveTextContent('overview');
  });
});

describe('useOrganizationProfileSecurityPanelController — remove-domain side-effect order', () => {
  it('removes a domain in the legacy order: drop from the connection → delete the domain → revalidate', async () => {
    updateConnection.mockImplementation(() => {
      removeDomainCalls.push('update');
      return Promise.resolve();
    });
    revalidateDomains.mockImplementation(() => {
      removeDomainCalls.push('revalidate');
      return Promise.resolve();
    });
    organizationDomains = [
      { id: 'dom_1', name: 'acme.com', delete: deleteDomain, ownershipVerification: { status: 'verified' } },
    ];
    enterpriseConnection = { id: 'ent_1', domains: ['acme.com', 'other.com'] };
    render(<Harness />);

    fireEvent.click(screen.getByText('remove open'));
    await act(async () => {
      fireEvent.click(screen.getByText('remove confirm'));
    });

    // The three side effects must fire in this exact sequence (legacy `handleRemoveDomain`).
    expect(removeDomainCalls).toEqual(['update', 'delete', 'revalidate']);
    // The connection is updated with the removed domain dropped, keeping the rest.
    expect(updateConnection).toHaveBeenCalledWith('ent_1', { domains: ['other.com'] });
  });
});
