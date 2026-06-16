import type { EnterpriseConnectionTestRunResource } from '@clerk/shared/types';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

// The Test step reads navigation through the generic wizard facade. `goPrev`
// drives the Previous button and `goNext` the (gated) Continue button.
const goPrev = vi.fn();
const goNext = vi.fn();

vi.mock('../../elements/Wizard', () => ({
  useWizard: () => ({ goPrev, goNext }),
}));

// The single test-run source, owned upstream by
// `useOrganizationEnterpriseConnection` and read off context. The Test step no
// longer issues its own fetch — these are the rows/flags it renders, and
// `refresh` is the navigation-entry refetch handle.
const testRunsSource = vi.hoisted(() => ({
  rows: [] as EnterpriseConnectionTestRunResource[],
  totalCount: 0,
  isLoading: false,
  isFetching: false,
  isPolling: false,
  page: 1,
  setPage: vi.fn(),
  refresh: vi.fn(() => Promise.resolve()),
}));

const createTestRun = vi.fn(() => Promise.resolve({ url: 'https://idp.example.com/test' }));

vi.mock('../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: { id: 'ent_1' },
    contentRef: { current: null },
    // The step reads `hasSuccessfulTestRun` as a field off the connection entity;
    // a getter keeps the mock deriving it from the current rows so the Continue
    // gate reflects them on every render. `hasConnection: false` keeps the footer
    // `Step.Footer.Reset` self-hidden in this isolated render.
    organizationEnterpriseConnection: {
      hasConnection: false,
      get hasSuccessfulTestRun() {
        return testRunsSource.rows.some(r => r.status === 'success');
      },
    },
    testRuns: testRunsSource,
    enterpriseConnectionMutations: { createTestRun },
  }),
}));

import { TestConfigurationStep } from '../TestConfigurationStep';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

const renderStep = (
  wrapper: React.ComponentType<{ children?: React.ReactNode }>,
  ui: ReactElement = <TestConfigurationStep />,
) => render(<CardStateProvider>{ui}</CardStateProvider>, { wrapper });

const aRow = (overrides: Partial<EnterpriseConnectionTestRunResource> = {}): EnterpriseConnectionTestRunResource =>
  ({
    id: 'run_1',
    status: 'success',
    createdAt: new Date('2026-06-02T10:00:00Z'),
    parsedUserInfo: { emailAddress: 'user@clerk.com' },
    logs: [],
    ...overrides,
  }) as EnterpriseConnectionTestRunResource;

beforeEach(() => {
  goPrev.mockReset();
  goNext.mockReset();
  createTestRun.mockClear();
  testRunsSource.setPage.mockReset();
  testRunsSource.refresh.mockReset();
  testRunsSource.refresh.mockImplementation(() => Promise.resolve());
  testRunsSource.rows = [];
  testRunsSource.totalCount = 0;
  testRunsSource.isLoading = false;
  testRunsSource.isFetching = false;
  testRunsSource.isPolling = false;
  testRunsSource.page = 1;
});

describe('TestConfigurationStep', () => {
  it('renders the table rows from the single source, not its own fetch', async () => {
    testRunsSource.rows = [aRow({ id: 'run_1', parsedUserInfo: { emailAddress: 'alice@clerk.com' } })];
    testRunsSource.totalCount = 1;
    const { wrapper } = await createFixtures();

    renderStep(wrapper);

    expect(await screen.findByText('alice@clerk.com')).toBeInTheDocument();
    // A success row → the Success status badge from the single source's rows.
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('shows the empty state when the single source has no rows', async () => {
    const { wrapper } = await createFixtures();

    renderStep(wrapper);

    expect(await screen.findByText('No test results')).toBeInTheDocument();
  });

  it('does NOT refetch on mount in either entry case', async () => {
    const { wrapper } = await createFixtures();

    renderStep(wrapper);

    await screen.findByText('No test results');
    // The test-run queries live in the umbrella hook ABOVE the step, so they do
    // not unmount on leaving and re-fetch on re-entry. The initial ConfigureSSO
    // load already fetched them (full skeleton covered it), and a kicked-off run
    // arms its own poll, so the data stays fresh while navigating away. The step
    // therefore never refetches on mount — neither on the initial load nor on a
    // later navigation into the step.
    expect(testRunsSource.refresh).not.toHaveBeenCalled();
  });

  it('drives the table spinner off isFetching while keeping prior rows visible', async () => {
    // A background list refetch is in flight (isFetching) but it is not a cold
    // load (isLoading false) and previous rows are kept visible.
    testRunsSource.rows = [aRow({ id: 'run_1', parsedUserInfo: { emailAddress: 'alice@clerk.com' } })];
    testRunsSource.totalCount = 1;
    testRunsSource.isFetching = true;
    testRunsSource.isLoading = false;
    const { wrapper } = await createFixtures();

    renderStep(wrapper);

    // Prior rows stay on screen during the background refetch.
    expect(await screen.findByText('alice@clerk.com')).toBeInTheDocument();
  });

  it('advances on Continue once there is a successful test run', async () => {
    // A success row flips the derived state's `hasSuccessfulTestRun` (derived in
    // the mocked context from the rows), so the step-local Continue gate passes
    // and the wizard advances.
    testRunsSource.rows = [aRow({ id: 'run_1', status: 'success' })];
    testRunsSource.totalCount = 1;
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    expect(goNext).toHaveBeenCalledTimes(1);
  });

  it('surfaces an inline error and stays put when there is no successful test run', async () => {
    // No success row → the gate fails. Continue stays enabled (matching legacy)
    // so the user gets the validation message instead of a silently disabled
    // button, and the wizard does not advance.
    testRunsSource.rows = [aRow({ id: 'run_1', status: 'failed' })];
    testRunsSource.totalCount = 1;
    const { wrapper } = await createFixtures();
    const { userEvent } = renderStep(wrapper);

    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    expect(goNext).not.toHaveBeenCalled();
    expect(await screen.findByText(/You need at least one successful test run/i)).toBeInTheDocument();
  });
});
