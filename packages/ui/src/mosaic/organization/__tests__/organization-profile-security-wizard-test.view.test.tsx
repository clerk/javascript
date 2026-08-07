import type { EnterpriseConnectionTestRunResource } from '@clerk/shared/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TestRunsView } from '@/components/ConfigureSSO/hooks/useOrganizationEnterpriseConnection';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type { OrganizationProfileSecurityWizardTestStep } from '../organization-profile-security-panel.controller';
import type { OrganizationProfileSecurityWizardTestContext } from '../organization-profile-security-wizard-test.machine';
import { OrganizationProfileSecurityWizardTestView } from '../organization-profile-security-wizard-test.view';

const snapshot = (
  value: string,
  context: Partial<OrganizationProfileSecurityWizardTestContext> = {},
): Snapshot<OrganizationProfileSecurityWizardTestContext> => ({
  value,
  status: 'active',
  context: {
    hasSuccessfulTestRun: false,
    error: null,
    noSuccessfulRunMessage: 'no successful run',
    createTestRun: async () => {},
    revalidateHasSuccessfulTestRun: async () => false,
    ...context,
  },
});

const row = (overrides: Partial<EnterpriseConnectionTestRunResource> = {}): EnterpriseConnectionTestRunResource => {
  const fixture = {
    id: 'tr_1',
    status: 'success',
    createdAt: null,
    logs: [],
    parsedUserInfo: null,
    ...overrides,
  };
  // SAFETY: the view reads only id/status/parsedUserInfo/logs off a run; this partial fixture covers
  // those and the test never touches the resource's methods, so the boundary cast is safe here.
  return fixture as unknown as EnterpriseConnectionTestRunResource;
};

const testRunsView = (overrides: Partial<TestRunsView> = {}): TestRunsView => ({
  rows: [],
  totalCount: 0,
  isLoading: false,
  isFetching: false,
  isPolling: false,
  page: 1,
  setPage: vi.fn(),
  refresh: vi.fn(() => Promise.resolve()),
  revalidateHasSuccessfulTestRun: vi.fn(() => Promise.resolve(false)),
  ...overrides,
});

function renderView(overrides: Partial<OrganizationProfileSecurityWizardTestStep> = {}) {
  const send = vi.fn();
  const onParentPrev = vi.fn();

  const test: OrganizationProfileSecurityWizardTestStep = {
    snapshot: snapshot('idle'),
    send,
    testRuns: testRunsView(),
    onParentPrev,
    ...overrides,
  };

  render(
    <MosaicProvider>
      <OrganizationProfileSecurityWizardTestView test={test} />
    </MosaicProvider>,
  );

  return { send, onParentPrev, test };
}

describe('OrganizationProfileSecurityWizardTestView — mount', () => {
  it('fires ENTER once on mount', () => {
    const { send } = renderView();
    expect(send).toHaveBeenCalledWith({ type: 'ENTER' });
    expect(send.mock.calls.filter(([event]) => event.type === 'ENTER')).toHaveLength(1);
  });
});

describe('OrganizationProfileSecurityWizardTestView — actions', () => {
  it('creates a test run from the open-test-url button', () => {
    const { send } = renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Open test URL' }));
    expect(send).toHaveBeenCalledWith({ type: 'CREATE_RUN' });
  });

  it('refreshes the logs WITHOUT arming polling', () => {
    const refresh = vi.fn(() => Promise.resolve());
    renderView({ testRuns: testRunsView({ refresh }) });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh logs' }));
    // The manual refresh must never arm polling — only creating a run does.
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith();
  });

  it('continues via the footer', () => {
    const { send } = renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(send).toHaveBeenCalledWith({ type: 'CONTINUE' });
  });

  it('forwards Back to the outer wizard', () => {
    const { onParentPrev } = renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onParentPrev).toHaveBeenCalled();
  });
});

describe('OrganizationProfileSecurityWizardTestView — results', () => {
  it('renders the test-run rows with their status', () => {
    renderView({
      testRuns: testRunsView({
        rows: [row({ id: 'tr_1', status: 'success' }), row({ id: 'tr_2', status: 'failed' })],
        totalCount: 2,
      }),
    });
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('shows the error message from the machine', () => {
    renderView({ snapshot: snapshot('idle', { error: 'You need at least one successful test run.' }) });
    expect(screen.getByRole('alert')).toHaveTextContent('You need at least one successful test run.');
  });
});
