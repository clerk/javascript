import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { OrganizationEnterpriseConnection } from '@/components/ConfigureSSO/domain/organizationEnterpriseConnection';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type { OrganizationProfileSecurityPanelViewProps } from '../organization-profile-security-panel.view';
import { OrganizationProfileSecurityPanelView } from '../organization-profile-security-panel.view';
import type { OrganizationProfileSecurityPanelOverviewContext } from '../organization-profile-security-panel-overview.machine';
import type { OrganizationProfileSecurityWizardContext } from '../organization-profile-security-wizard.machine';

const buildConnection = (
  overrides: Partial<OrganizationEnterpriseConnection> = {},
): OrganizationEnterpriseConnection => ({
  provider: undefined,
  hasConnection: false,
  isActive: false,
  hasMinimumConfiguration: false,
  hasSuccessfulTestRun: false,
  status: 'unconfigured',
  ...overrides,
});

const overviewSnapshot = (
  value: string,
  context: Partial<OrganizationProfileSecurityPanelOverviewContext> = {},
): Snapshot<OrganizationProfileSecurityPanelOverviewContext> => ({
  value,
  status: 'active',
  context: {
    organizationName: 'Acme Inc',
    confirmationValue: '',
    activateConnection: async () => {},
    deactivateConnection: async () => {},
    removeConnection: async () => {},
    error: null,
    ...context,
  },
});

const wizardSnapshot = (
  value: string,
  context: Partial<OrganizationProfileSecurityWizardContext> = {},
): Snapshot<OrganizationProfileSecurityWizardContext> => ({
  value,
  status: 'active',
  context: {
    direction: 0,
    hasNavigated: false,
    pendingNext: false,
    allDomainsVerified: false,
    hasConnection: false,
    hasMinimumConfiguration: false,
    isActive: false,
    hasSuccessfulTestRun: false,
    ...context,
  },
});

// A verify-domain step with empty machines — the panel-view tests only exercise the shell,
// so the step body just needs valid (idle) flows to render without crashing.
const buildDomainsStep = (): OrganizationProfileSecurityPanelViewProps['domainsStep'] => ({
  domains: [],
  suggestedDomain: null,
  hasConnection: false,
  isConnectionActive: false,
  add: {
    snapshot: {
      value: 'idle',
      status: 'active',
      context: { draftName: '', pendingName: '', error: null, createDomain: async () => {} },
    },
    send: vi.fn(),
  },
  prepare: {
    snapshot: {
      value: 'idle',
      status: 'active',
      context: { pendingDomainId: '', error: null, prepareVerification: async () => {} },
    },
    send: vi.fn(),
  },
  remove: {
    snapshot: {
      value: 'idle',
      status: 'active',
      context: { domainName: '', isConnectionActive: false, removeDomain: async () => {}, error: null },
    },
    send: vi.fn(),
  },
  onStepMounted: vi.fn(),
});

// A configure step seated at select-provider with no connection — the panel-view shell tests only
// need a valid (idle) flow so the step body renders without crashing.
const buildConfigureStep = (): OrganizationProfileSecurityPanelViewProps['configureStep'] => ({
  snapshot: {
    value: 'selecting',
    status: 'active',
    context: {
      providerSteps: [],
      submitIndex: -1,
      stepIndex: 0,
      direction: 0,
      hasConnection: false,
      error: null,
      pendingEnter: false,
      pendingProvider: null,
      pendingPayload: {},
      createConnection: async () => {},
      changeProvider: async () => {},
      updateConnection: async () => {},
    },
  },
  send: vi.fn(),
  provider: undefined,
  providerSteps: [],
  submitStepId: 'identity-provider-metadata',
  enteredForward: false,
  onParentNext: vi.fn(),
  onParentPrev: vi.fn(),
});

// A test step seated at idle with an empty run list — the panel-view shell tests never seat the
// wizard on `test`, so this just needs a valid (idle) flow to satisfy the prop type.
const buildTestStep = (): OrganizationProfileSecurityPanelViewProps['testStep'] => ({
  snapshot: {
    value: 'idle',
    status: 'active',
    context: {
      hasSuccessfulTestRun: false,
      error: null,
      noSuccessfulRunMessage: '',
      createTestRun: async () => {},
      revalidateHasSuccessfulTestRun: async () => false,
    },
  },
  send: vi.fn(),
  testRuns: {
    rows: [],
    totalCount: 0,
    isLoading: false,
    isFetching: false,
    isPolling: false,
    page: 1,
    setPage: vi.fn(),
    refresh: vi.fn(() => Promise.resolve()),
    revalidateHasSuccessfulTestRun: vi.fn(() => Promise.resolve(false)),
  },
  onParentPrev: vi.fn(),
});

function renderView(overrides: Partial<OrganizationProfileSecurityPanelViewProps> = {}) {
  const openWizard = vi.fn();
  const exitWizard = vi.fn();
  const overviewSend = vi.fn();
  const wizardSend = vi.fn();

  const props: OrganizationProfileSecurityPanelViewProps = {
    mode: 'overview',
    isLoading: false,
    organizationName: 'Acme Inc',
    connection: buildConnection(),
    enterpriseConnection: undefined,
    openWizard,
    exitWizard,
    overview: { snapshot: overviewSnapshot('idle'), send: overviewSend, canConfirmRemove: false },
    wizard: { snapshot: wizardSnapshot('verify-domain'), send: wizardSend },
    domainsStep: buildDomainsStep(),
    configureStep: buildConfigureStep(),
    testStep: buildTestStep(),
    ...overrides,
  };

  render(
    <MosaicProvider>
      <OrganizationProfileSecurityPanelView {...props} />
    </MosaicProvider>,
  );

  return { openWizard, exitWizard, overviewSend, wizardSend };
}

describe('OrganizationProfileSecurityPanelView — status badge + entry points', () => {
  it('renders the Unconfigured badge and a Start configuration button that forces the first step', () => {
    const { openWizard } = renderView({ connection: buildConnection({ status: 'unconfigured' }) });

    expect(screen.getByText('Unconfigured')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start configuration' }));
    expect(openWizard).toHaveBeenCalledWith(true);
  });

  it('renders the In Progress badge and a Continue configuration button that resumes', () => {
    const { openWizard } = renderView({ connection: buildConnection({ hasConnection: true, status: 'in_progress' }) });

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue configuration' }));
    expect(openWizard).toHaveBeenCalledWith();
  });

  it('renders the Active badge and the configured action buttons', () => {
    renderView({ connection: buildConnection({ hasConnection: true, isActive: true, status: 'active' }) });

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('renders the Inactive badge and an Activate action', () => {
    renderView({
      connection: buildConnection({ hasConnection: true, hasMinimumConfiguration: true, status: 'inactive' }),
    });

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument();
  });
});

describe('OrganizationProfileSecurityPanelView — configured actions', () => {
  const activeConnection = buildConnection({ hasConnection: true, isActive: true, status: 'active' });

  it('opens the wizard at the first step from Edit', () => {
    const { openWizard } = renderView({ connection: activeConnection });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(openWizard).toHaveBeenCalledWith(true);
  });

  it('sends DEACTIVATE from the active connection', () => {
    const { overviewSend } = renderView({ connection: activeConnection });
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    expect(overviewSend).toHaveBeenCalledWith({ type: 'DEACTIVATE' });
  });

  it('sends ACTIVATE from an inactive connection', () => {
    const { overviewSend } = renderView({
      connection: buildConnection({ hasConnection: true, hasMinimumConfiguration: true, status: 'inactive' }),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));
    expect(overviewSend).toHaveBeenCalledWith({ type: 'ACTIVATE' });
  });

  it('disables the activate/deactivate action while a mutation is in flight', () => {
    renderView({
      connection: activeConnection,
      overview: { snapshot: overviewSnapshot('deactivating'), send: vi.fn(), canConfirmRemove: false },
    });
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeDisabled();
  });

  it('lists the connection domains as chips', () => {
    renderView({ connection: activeConnection, enterpriseConnection: { domains: ['acme.com', 'acme.io'] } });
    expect(screen.getByText('Domains:')).toBeInTheDocument();
    expect(screen.getByText('acme.com')).toBeInTheDocument();
    expect(screen.getByText('acme.io')).toBeInTheDocument();
  });

  it('surfaces a mutation error in the section alert when the remove dialog is closed', () => {
    renderView({
      connection: activeConnection,
      overview: {
        snapshot: overviewSnapshot('idle', { error: 'Cannot deactivate the only connection' }),
        send: vi.fn(),
        canConfirmRemove: false,
      },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Cannot deactivate the only connection');
  });
});

describe('OrganizationProfileSecurityPanelView — remove dialog', () => {
  const activeConnection = buildConnection({ hasConnection: true, isActive: true, status: 'active' });

  it('opens the remove flow from the Remove trigger', () => {
    const { overviewSend } = renderView({ connection: activeConnection });
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(overviewSend).toHaveBeenCalledWith({ type: 'OPEN_REMOVE' });
  });

  it('emits a typed confirmation and blocks confirm until it matches', () => {
    const overviewSend = vi.fn();
    renderView({
      connection: activeConnection,
      overview: { snapshot: overviewSnapshot('confirmingRemove'), send: overviewSend, canConfirmRemove: false },
    });

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Acme Inc' } });
    expect(overviewSend).toHaveBeenCalledWith({ type: 'TYPE_CONFIRMATION', value: 'Acme Inc' });
    expect(screen.getByRole('button', { name: 'Remove connection' })).toBeDisabled();
  });

  it('confirms removal once the confirmation matches', () => {
    const overviewSend = vi.fn();
    renderView({
      connection: activeConnection,
      overview: {
        snapshot: overviewSnapshot('confirmingRemove', { confirmationValue: 'Acme Inc' }),
        send: overviewSend,
        canConfirmRemove: true,
      },
    });

    const form = screen.getByRole('textbox').closest('form');
    expect(form).not.toBeNull();
    if (form) {
      fireEvent.submit(form);
    }
    expect(overviewSend).toHaveBeenCalledWith({ type: 'CONFIRM_REMOVE' });
  });
});

describe('OrganizationProfileSecurityPanelView — loading + wizard mode', () => {
  it('shows the overview skeleton (not the overview content) while loading in overview mode', () => {
    renderView({ mode: 'overview', isLoading: true, connection: buildConnection({ status: 'unconfigured' }) });
    expect(screen.queryByRole('button', { name: 'Start configuration' })).not.toBeInTheDocument();
  });

  it('keeps the wizard mounted regardless of loading and renders the current step', () => {
    // `activate` still renders the placeholder step body (configure + test own their own views now).
    renderView({ mode: 'wizard', isLoading: true, wizard: { snapshot: wizardSnapshot('activate'), send: vi.fn() } });
    expect(screen.getByTestId('security-wizard-step')).toHaveTextContent('activate');
  });

  it('returns to the overview from the wizard back control', () => {
    const { exitWizard } = renderView({ mode: 'wizard' });
    fireEvent.click(screen.getByRole('button', { name: 'Back to overview' }));
    expect(exitWizard).toHaveBeenCalled();
  });
});

describe('OrganizationProfileSecurityPanelView — wizard navigation + breadcrumb', () => {
  it('disables Back on the first step and Continue on the last step', () => {
    renderView({ mode: 'wizard', wizard: { snapshot: wizardSnapshot('verify-domain'), send: vi.fn() } });
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
  });

  it('sends NEXT from the shell nav on a step that does not own its own nav (verify-domain)', () => {
    const send = vi.fn();
    // configure + test own their nav; verify-domain (first) still uses the shell's generic Continue.
    renderView({ mode: 'wizard', wizard: { snapshot: wizardSnapshot('verify-domain'), send } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(send).toHaveBeenCalledWith({ type: 'NEXT' });
  });

  it('sends PREV from the shell nav on a step that does not own its own nav (activate)', () => {
    const send = vi.fn();
    // activate (last) still uses the shell's generic Back; seed it reachable.
    renderView({
      mode: 'wizard',
      wizard: {
        snapshot: wizardSnapshot('activate', {
          allDomainsVerified: true,
          hasConnection: true,
          hasMinimumConfiguration: true,
          hasSuccessfulTestRun: true,
        }),
        send,
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(send).toHaveBeenCalledWith({ type: 'PREV' });
  });

  it('marks the current breadcrumb step and jumps to a reachable step via GOTO', () => {
    const send = vi.fn();
    // Domains verified + configured → configure and test are reachable; sit on configure.
    renderView({
      mode: 'wizard',
      wizard: {
        snapshot: wizardSnapshot('configure', {
          allDomainsVerified: true,
          hasConnection: true,
          hasMinimumConfiguration: true,
        }),
        send,
      },
    });

    expect(screen.getByRole('button', { name: /Connection/ })).toHaveAttribute('aria-current', 'step');
    fireEvent.click(screen.getByRole('button', { name: /Test/ }));
    expect(send).toHaveBeenCalledWith({ type: 'GOTO', step: 'test' });
  });

  it('disables an unreachable breadcrumb step', () => {
    renderView({ mode: 'wizard', wizard: { snapshot: wizardSnapshot('verify-domain'), send: vi.fn() } });
    // Nothing configured → Activate is unreachable.
    expect(screen.getByRole('button', { name: /Activate/ })).toBeDisabled();
  });

  it('ticks completed breadcrumb steps', () => {
    renderView({
      mode: 'wizard',
      wizard: { snapshot: wizardSnapshot('configure', { allDomainsVerified: true }), send: vi.fn() },
    });
    // verify-domain is complete (all domains verified).
    expect(screen.getByRole('button', { name: /Domains ✓/ })).toBeInTheDocument();
  });
});
