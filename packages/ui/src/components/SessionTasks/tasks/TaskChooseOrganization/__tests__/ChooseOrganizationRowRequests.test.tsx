import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';
import { createFakeUserOrganizationSuggestion } from '@/ui/components/OrganizationSwitcher/__tests__/test-utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { TaskChooseOrganization } from '..';
import { InvitationPreview, MembershipPreview, SuggestionPreview } from '../choose-organization-screen.rows';

const { createFixtures } = bindCreateFixtures('TaskChooseOrganization');
const CardBoundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
const organization = { id: 'org_1', name: 'First organization', slug: 'first', imageUrl: '', hasImage: false };
const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });
type Kind = 'membership' | 'invitation' | 'suggestion';
const label = (kind: Kind) =>
  kind === 'membership' ? /First organization/ : kind === 'invitation' ? 'Join' : 'Request to join';
const CardStatus = () => {
  const card = useCardState();
  return (
    <>
      <span role='status'>{card.isLoading ? 'loading' : 'idle'}</span>
      {card.error && <span role='alert'>{card.error}</span>}
    </>
  );
};
const Row = ({ kind, run }: { kind: Kind; run: () => Promise<any> }) => {
  if (kind === 'membership') {
    return (
      <MembershipPreview
        row={{ id: 'mem_1', organization, activate: run }}
        isOrganizationListLoaded
        createOrganizationEnabled
      />
    );
  }
  if (kind === 'invitation') {
    return (
      <InvitationPreview
        row={{ id: 'inv_1', organization, accept: run }}
        isOrganizationListLoaded
        createOrganizationEnabled
      />
    );
  }
  return <SuggestionPreview row={{ id: 'sug_1', organization, status: 'pending', accept: run }} />;
};
const Harness = ({ kind, source, run }: { kind: Kind; source: string; run: () => Promise<any> }) => (
  <CardBoundary>
    <CardStatus />
    <Row
      key={source}
      kind={kind}
      run={run}
    />
  </CardBoundary>
);
async function setup() {
  return createFixtures(f => {
    f.withOrganizations();
    f.withForceOrganizationSelection();
    f.withUser({
      email_addresses: ['first@clerk.com'],
      create_organization_enabled: true,
      tasks: [{ key: 'choose-organization' }],
    });
  });
}

describe('task organization row requests', () => {
  it.each(['membership', 'invitation', 'suggestion'] as const)(
    'starts one %s request for two clicks before rendering',
    async kind => {
      const { wrapper } = await setup();
      const deferred = createDeferredPromise<any>();
      const run = vi.fn(() => deferred.promise);
      const { getByRole } = render(
        <Harness
          kind={kind}
          source='first'
          run={run}
        />,
        { wrapper },
      );
      const button = getByRole('button', { name: label(kind) });
      act(() => {
        button.click();
        button.click();
      });
      expect(run).toHaveBeenCalledOnce();
      expect(button).toBeDisabled();
      await act(async () => {
        deferred.resolve(kind === 'membership' ? 'success' : undefined);
        await deferred.promise;
      });
      expect(getByRole('status')).toHaveTextContent('idle');
      expect(button).toBeEnabled();
    },
  );

  describe.each(['success', 'failure'] as const)('after an old %s', outcome => {
    it.each(['membership', 'invitation', 'suggestion'] as const)(
      'keeps a replacement %s request busy after an old completion',
      async kind => {
        const { wrapper } = await setup();
        const first = createDeferredPromise<any>();
        const second = createDeferredPromise<any>();
        const { getByRole, queryByRole, rerender, userEvent } = render(
          <Harness
            kind={kind}
            source='first'
            run={() => first.promise}
          />,
          { wrapper },
        );
        await userEvent.click(getByRole('button', { name: label(kind) }));
        rerender(
          <Harness
            kind={kind}
            source='second'
            run={() => second.promise}
          />,
        );
        await waitFor(() => expect(getByRole('status')).toHaveTextContent('idle'));
        const button = getByRole('button', { name: label(kind) });
        await userEvent.click(button);
        await act(async () => {
          if (outcome === 'failure') {
            first.reject(failure());
          } else {
            first.resolve(
              kind === 'membership'
                ? 'unauthorized'
                : kind === 'invitation'
                  ? {
                      id: 'stale',
                      organization: { ...organization, name: 'Stale organization' },
                      activate: vi.fn(),
                    }
                  : undefined,
            );
          }
          await first.promise.catch(() => {});
        });
        expect(getByRole('status')).toHaveTextContent('loading');
        expect(button).toBeDisabled();
        expect(queryByRole('alert')).not.toBeInTheDocument();
        expect(queryByRole('button', { name: /Stale organization/ })).not.toBeInTheDocument();
        await act(async () => {
          second.resolve(kind === 'membership' ? 'success' : undefined);
          await second.promise;
        });
        expect(getByRole('status')).toHaveTextContent('idle');
      },
    );
  });

  it('shows a suggestion failure in the task and permits a retry', async () => {
    const { wrapper, fixtures } = await setup();
    const suggestion = createFakeUserOrganizationSuggestion({
      id: 'sug_1',
      emailAddress: 'first@clerk.com',
      publicOrganizationData: { id: 'org_1', name: 'Suggested organization' },
    });
    suggestion.accept = vi
      .fn()
      .mockRejectedValueOnce(failure())
      .mockResolvedValueOnce({ ...suggestion, status: 'accepted' });
    fixtures.clerk.user?.getOrganizationSuggestions.mockResolvedValue({ data: [suggestion], total_count: 1 });
    const { findByRole, findByText, queryByText, userEvent } = render(<TaskChooseOrganization />, { wrapper });
    await userEvent.click(await findByRole('button', { name: 'Request to join' }));
    expect(await findByText('Please try again')).toBeInTheDocument();
    await userEvent.click(await findByRole('button', { name: 'Request to join' }));
    expect(await findByText('Pending approval')).toBeInTheDocument();
    expect(queryByText('Please try again')).not.toBeInTheDocument();
    expect(suggestion.accept).toHaveBeenCalledTimes(2);
  });
});
