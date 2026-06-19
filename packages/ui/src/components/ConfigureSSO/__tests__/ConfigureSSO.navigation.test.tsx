import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { ConfigureSSO } from '../ConfigureSSO';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

/** A connection created on the fresh-start path: present but not yet configured. */
const unconfiguredConnection = {
  id: 'ent_new',
  name: 'clerk.com',
  provider: 'saml_okta',
  active: false,
  organizationId: 'Org1',
  domains: ['clerk.com'],
  samlConnection: null,
};

/** A SAML-configured (but inactive, untested) connection → reaches the test step. */
const configuredConnection = {
  id: 'ent_configured',
  name: 'clerk.com',
  provider: 'saml_okta',
  active: false,
  organizationId: 'Org1',
  domains: ['clerk.com'],
  samlConnection: {
    idpSsoUrl: 'https://idp.example.com/sso',
    idpEntityId: 'https://idp.example.com/entity',
    idpCertificate: 'CERT',
  },
};

const withAdminOrgUser = (f: any) => {
  f.withEnterpriseSso({ selfServeSSO: true });
  f.withEmailAddress();
  f.withOrganizations();
  f.withUser({
    email_addresses: ['test@clerk.com'],
    organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
  });
};

const verifiedDomain = {
  id: 'dmn_verified',
  name: 'clerk.com',
  organizationId: 'Org1',
  enrollmentMode: 'enterprise_sso',
  ownershipVerification: { status: 'verified', strategy: 'txt' },
} as any;

const mockVerifiedDomains = (fixtures: any) =>
  fixtures.clerk.organization?.getDomains.mockResolvedValue({ data: [verifiedDomain], total_count: 1 } as any);

describe('ConfigureSSO wizard navigation (integration)', () => {
  it('lands on select-provider when all organization domains are verified (skips verify-domain)', async () => {
    const { wrapper, fixtures } = await createFixtures(withAdminOrgUser);

    fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);
    fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
      data: [],
      total_count: 0,
    } as any);
    mockVerifiedDomains(fixtures);

    const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

    await findByText(/select your identity provider/i);
    // verify-domain was skipped, so its subtitle never renders
    expect(queryByText(/add and verify ownership of the domains/i)).not.toBeInTheDocument();
  });

  // Contract rules 2 + 8: goNext defers when the next guard is not yet satisfied
  // (the create has fired but the connection has not landed), then completes on
  // the render after the data lands — here select-provider → configure on the
  // first Continue click.
  it('create → deferred advance: select-provider Continue lands on configure once the connection appears', async () => {
    const { wrapper, fixtures } = await createFixtures(withAdminOrgUser);

    // First settle: no connection ⇒ mounts on select-provider. After the create's
    // revalidate: an unconfigured connection is present ⇒ `configure`'s guard
    // (`hasConnection`) holds and the deferred advance resolves to it.
    fixtures.clerk.organization?.getEnterpriseConnections
      .mockResolvedValueOnce([])
      .mockResolvedValue([unconfiguredConnection] as any);
    fixtures.clerk.organization?.createEnterpriseConnection.mockResolvedValue(unconfiguredConnection as any);
    fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
      data: [],
      total_count: 0,
    } as any);
    mockVerifiedDomains(fixtures);

    const { findByText, findByRole, getByRole, userEvent, queryByText } = render(<ConfigureSSO />, { wrapper });

    await findByText(/select your identity provider/i);

    await userEvent.click(getByRole('radio', { name: 'Okta Workforce' }));
    await userEvent.click(getByRole('button', { name: /continue/i }));

    // The connection lands on the create's revalidate and the deferred goNext
    // resolves to configure — the Okta sub-flow's first step renders.
    await findByRole('heading', { name: /configure okta workforce/i });
    await waitFor(() => {
      expect(queryByText(/select your identity provider/i)).not.toBeInTheDocument();
    });
  });

  it('resumes the provider configuration when entering configure with an existing in-progress connection', async () => {
    const { wrapper, fixtures } = await createFixtures(withAdminOrgUser);

    fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([unconfiguredConnection] as any);
    fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
      data: [],
      total_count: 0,
    } as any);
    mockVerifiedDomains(fixtures);

    const { findByRole, queryByText } = render(<ConfigureSSO />, { wrapper });

    await findByRole('heading', { name: /configure okta workforce/i });
    expect(queryByText(/select your identity provider/i)).not.toBeInTheDocument();
  });

  // Contract rules 7 + 10: reset deletes the connection, then the wizard
  // re-derives to the furthest-reachable step for the now-no-connection state
  // (select-provider, since the email is verified) and renders a real step body —
  // it never strands on a blank pane.
  it('reset → re-derive: deleting from the test step lands on select-provider (no strand)', async () => {
    const { wrapper, fixtures } = await createFixtures(withAdminOrgUser);

    // First settle: a configured connection ⇒ mounts on the test step. After the
    // delete's revalidate: no connection ⇒ the clamp re-seats to the furthest-
    // reachable step (select-provider).
    fixtures.clerk.organization?.getEnterpriseConnections
      .mockResolvedValueOnce([configuredConnection] as any)
      .mockResolvedValue([] as any);
    fixtures.clerk.organization?.deleteEnterpriseConnection.mockResolvedValue({ id: 'ent_configured' } as any);
    fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
      data: [],
      total_count: 0,
    } as any);
    mockVerifiedDomains(fixtures);

    const { findByText, getByRole, getByLabelText, findByRole, userEvent, queryByText } = render(<ConfigureSSO />, {
      wrapper,
    });

    await findByText(/test your sso connection/i);

    // Open the reset dialog from the test-step footer, type-to-confirm with the
    // organization name, and confirm.
    await userEvent.click(getByRole('button', { name: /reset connection/i }));
    await userEvent.type(getByLabelText(/below to continue/i), 'Org1');
    const confirmButton = await findByRole('button', { name: /reset connection/i });
    await waitFor(() => expect(confirmButton).toBeEnabled());
    await userEvent.click(confirmButton);

    // The delete revalidates to an empty list; the wizard self-corrects to a real
    // rendered step (select-provider), not a blank pane.
    await findByText(/select your identity provider/i);
    expect(queryByText(/test your sso connection/i)).not.toBeInTheDocument();
  });

  // A card error surfaced on one step must not leak into the next. Each top-level
  // step owns its own `CardStateProvider`, so the error lives in the departed
  // step's scope only — leaving that step unmounts the provider and the error
  // with it; the step we land on mounts a clean card scope.
  it('card errors do not leak across steps: a test-step error clears after navigating back', async () => {
    const { wrapper, fixtures } = await createFixtures(withAdminOrgUser);

    fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection] as any);
    fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
      data: [],
      total_count: 0,
    } as any);
    mockVerifiedDomains(fixtures);

    const { findByText, findByRole, getByRole, userEvent, queryByText } = render(<ConfigureSSO />, { wrapper });

    await findByText(/test your sso connection/i);

    // Continue with no successful run surfaces the inline validation error on the
    // test step's card.
    await userEvent.click(getByRole('button', { name: /continue/i }));
    await findByText(/at least one successful test run/i);

    // Going back to configure leaves the test step; its provider unmounts and the
    // error goes with it, so it does not leak into the next step.
    await userEvent.click(getByRole('button', { name: /previous/i }));
    await findByRole('heading', { name: /configure okta workforce/i });
    await waitFor(() => {
      expect(queryByText(/at least one successful test run/i)).not.toBeInTheDocument();
    });
  });

  // The case the old shared-card / callback mechanism missed: the wizard's
  // clamp/reset re-seat went through raw `setState`, never the step-change
  // callback, so a card error raised on the test step survived the emergent
  // re-seat. With per-step providers the error lives in the test step's scope, so
  // a reset that re-seats to select-provider lands on a clean card.
  it('card errors do not survive a reset re-seat: a test-step error is gone on select-provider', async () => {
    const { wrapper, fixtures } = await createFixtures(withAdminOrgUser);

    // First settle: configured connection ⇒ mounts on the test step. After the
    // delete's revalidate: no connection ⇒ the clamp re-seats to select-provider.
    fixtures.clerk.organization?.getEnterpriseConnections
      .mockResolvedValueOnce([configuredConnection] as any)
      .mockResolvedValue([] as any);
    fixtures.clerk.organization?.deleteEnterpriseConnection.mockResolvedValue({ id: 'ent_configured' } as any);
    fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
      data: [],
      total_count: 0,
    } as any);
    mockVerifiedDomains(fixtures);

    const { findByText, getByRole, getByLabelText, findByRole, userEvent, queryByText } = render(<ConfigureSSO />, {
      wrapper,
    });

    await findByText(/test your sso connection/i);

    // Raise the inline validation error on the test step.
    await userEvent.click(getByRole('button', { name: /continue/i }));
    await findByText(/at least one successful test run/i);

    // Reset the connection from the test-step footer: type-to-confirm with the
    // organization name and confirm. The delete's revalidate empties the list and
    // the wizard self-corrects (clamp) back to select-provider.
    await userEvent.click(getByRole('button', { name: /reset connection/i }));
    await userEvent.type(getByLabelText(/below to continue/i), 'Org1');
    const confirmButton = await findByRole('button', { name: /reset connection/i });
    await waitFor(() => expect(confirmButton).toBeEnabled());
    await userEvent.click(confirmButton);

    // Landed on select-provider with a clean card — the test step's error did not
    // ride the re-seat.
    await findByText(/select your identity provider/i);
    await waitFor(() => {
      expect(queryByText(/at least one successful test run/i)).not.toBeInTheDocument();
    });
  });

  // The labelled steps surface in the stepper under their renamed labels, and an
  // active connection short-circuits to the (reachable) activate step.
  it('renders the renamed stepper labels and reaches the activate step', async () => {
    const { wrapper, fixtures } = await createFixtures(withAdminOrgUser);

    fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([
      { ...configuredConnection, id: 'ent_active', active: true } as any,
    ]);
    fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
      data: [],
      total_count: 0,
    } as any);
    mockVerifiedDomains(fixtures);

    const { findByText, getByText } = render(<ConfigureSSO />, { wrapper });

    // The activate step body renders (active connection short-circuits to the already-active variant).
    await findByText(/sso connection is active/i);

    // The stepper carries the renamed labels (select-provider stays unlabelled).
    expect(getByText('Domains')).toBeInTheDocument();
    expect(getByText('Connection')).toBeInTheDocument();
    expect(getByText('Test')).toBeInTheDocument();
    expect(getByText('Activate')).toBeInTheDocument();
  });

  // Completion is guard-driven, not positional: re-entering an ACTIVE connection
  // shows every stepper step ticked even after navigating BACK to an earlier step.
  // A completed (non-current) bullet renders a checkmark instead of its number, so
  // exactly one bullet — the current one — still shows a digit. Under the old
  // positional logic the steps AFTER current would lose their tick and show their
  // numbers again, so this asserts the fix directly.
  it('re-entering an active connection keeps every step completed after navigating back', async () => {
    const { wrapper, fixtures } = await createFixtures(withAdminOrgUser);

    fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([
      { ...configuredConnection, id: 'ent_active', active: true } as any,
    ]);
    fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
      data: [],
      total_count: 0,
    } as any);
    mockVerifiedDomains(fixtures);

    const { container, findByText, userEvent } = render(<ConfigureSSO />, { wrapper });

    // Mounts on the activate step (active connection short-circuits to it).
    await findByText(/sso connection is active/i);

    const stepper = () => container.querySelector('.cl-configureSSOStepper') as HTMLElement;
    const bulletDigitCount = () =>
      Array.from(stepper().querySelectorAll('.cl-configureSSOStepperItemBullet')).filter(el =>
        /\d/.test(el.textContent ?? ''),
      ).length;
    const stepperLabels = () =>
      Array.from(stepper().querySelectorAll('.cl-configureSSOStepperItemLabel')).map(el => el.textContent);
    const stepperButton = (label: string) =>
      Array.from(stepper().querySelectorAll<HTMLButtonElement>('.cl-configureSSOStepperItem')).find(
        btn => btn.textContent?.trim() === label,
      )!;

    // The breadcrumb carries all four labels.
    expect(stepperLabels()).toEqual(['Domains', 'Connection', 'Test', 'Activate']);

    // On the terminal step, the first three bullets are already ticked (checkmarks)
    // and only the current 'Activate' bullet shows its number.
    expect(bulletDigitCount()).toBe(1);

    // Navigate BACK to the first step via the breadcrumb. Every step's guard still
    // holds for an active connection, so 'Domains' is reachable.
    await userEvent.click(stepperButton('Domains'));

    // Positional completion would now un-tick Connection/Test/Activate (they sit
    // AFTER current) and show their numbers. Guard-driven completion keeps them
    // ticked, so still only the current 'Domains' bullet shows a digit.
    expect(bulletDigitCount()).toBe(1);
    expect(stepperLabels()).toEqual(['Domains', 'Connection', 'Test', 'Activate']);
  });
});
